require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// ✅ CORS設定
const corsOptions = {
  origin: [
    "https://invitationtonewworld.web.app",
    "https://invitationtonewworld.firebaseapp.com" // フロントのURL
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.options('/send', cors(corsOptions)); // プリフライト対応

app.use(express.json());

// 動作確認用
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/send', async (req, res) => {
  const { name, email } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `8/30 AFF へご招待。`,

      // 本文（テキスト版）
      text: `こんにちは ${name} さん！\n\nあなたを以下のパーティーにご招待します🎉\n\n`,

      // 本文（HTML版）
      html: `
        <p>こんにちは ${name} さん！</p>
        <p>あなたを以下のパーティーにご招待します 🎉</p>
        <!-- 画像を付けたい場合は下をコメントアウト外してください
        <p>
          <img src="cid:invite@aff" alt="イベントフライヤー"
               style="max-width:400px; border:1px solid #ccc;" />
        </p>
        -->
      `,

      // 添付ファイル（画像埋め込み用）
      // attachments: [
      //   {
      //     filename: 'flyer.jpg',
      //     path: path.join(__dirname, 'images', 'flyer.jpg'),
      //     cid: 'invite@aff'
      //   }
      // ]
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('メール送信エラー:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ サーバー起動時にSMTP接続テスト
const testTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

testTransporter.verify((err, success) => {
  if (err) {
    console.error("SMTP接続失敗:", err);
  } else {
    console.log("SMTP接続成功!");
  }
});

// エラー補足
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
