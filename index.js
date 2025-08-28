require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path'); // ← 画像添付用に追加

const app = express();
app.use(cors());
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

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `8/30 AFF　こんにちは ${name} さん！`,
      // 本文（テキスト版）
      text: `あなたを以下のパーティーにご招待します。\n\n${message || ''}`,

      // 本文（HTML版・画像埋め込み）
      html: `
        <h2>こんにちは ${name} さん！</h2>
        <p>あなたにささやかなご招待をお送りします 🎉</p>
        <p>
          <img src="cid:invite@aff" alt="イベントフライヤー"
               style="max-width:400px; border:1px solid #ccc;" />
        </p>
        <p>${message || ''}</p>
      `,

      // 添付ファイル（本文埋め込み用）
      attachments: [
        {
          filename: 'flyer.jpg',
          path: path.join(__dirname, 'images', 'flyer.jpg'), // プロジェクト内の画像パス
          cid: 'invite@aff' // ← 上のHTMLで指定したcidと一致させる
        }
      ]
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
