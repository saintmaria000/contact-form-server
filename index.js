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
      secure: process.env.SMTP_SECURE === 'boolean',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
        from: process.env.SMTP_USER, // ← 送信者（あなた）
        to: email, // ← フォーム入力者宛に送る
        subject: `8/３０.Invite Ticket`,
        html: `
        <h1>こんにちは${name} さん\n\n
        あなたを Event にご招待します。</h1>
        <img src="cid:invite@aff" />
        `,
        text: `8/30.AFF\n\n`,
        attachments: [
          {
            filename: 'flyer.jpg',
            path: path.join(__dirname, 'images', 'flyer.jpg'),
            cid: 'invite@aff', // 本文内のsrcと一致させる
          },
        ],
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
