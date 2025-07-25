require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

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
        from: process.env.SMTP_USER, // ← 送信者（あなた）
        to: email, // ← フォーム入力者宛に送る
        subject: `ご連絡ありがとうございます`,
        text: `こんにちは ${name} さん！\n\nあなたにささやかなご招待をお送りします。\n\n`,
    }); 

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
