require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path'); // ← 画像添付用に追加

const app = express();

// ✅ CORS設定
const corsOptions = {
  origin: "https://invitationtonewworld.web.app", // フロントのURL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.options('/send', cors(corsOptions)); // ← プリフライト対応

app.use(express.json());

// 動作確認用
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

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

    // ✅ SMTP接続確認（エラーが出たらログに出る）
    transporter.verify((err, success) => {
      if (err) {
        console.error("SMTP接続失敗:", err);
      } else {
        console.log("SMTP接続成功!");
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `8/30 AFF　こんにちは ${name} さん！`,
      
      // 本文（テキスト版）
      text: `あなたを以下のパーティーにご招待します。\n\n${message || ''}`,

      // 本文（HTML版・画像埋め込み）
      html: `
        <p>あなたにささやかなご招待をお送りします 🎉</p>
        // <p>
        //   <img src="cid:invite@aff" alt="イベントフライヤー"
        //        style="max-width:400px; border:1px solid #ccc;" />
        // </p>
        <p>${message || ''}</p>
      `,

      // 添付ファイル（本文埋め込み用）
      // attachments: [
      //   {
      //     filename: 'flyer.jpg',
      //     path: path.join(__dirname, 'images', 'flyer.jpg'), // ← サーバー内の画像パス
      //     cid: 'invite@aff' // ← 上のHTMLと一致
      //   }
      // ]
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('メール送信エラー:', error);
    res.status(500).send({ success: false, error: error.message });
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
