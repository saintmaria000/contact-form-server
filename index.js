require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
    const response = await fetch("https://api.maileroo.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MAILEROO_API_KEY}` // ← MailerooのAPIキー
      },
      body: JSON.stringify({
        from: `招待係 <${process.env.FROM_ADDRESS}>`, // 例: no-reply@xxxx.maileroo.org
        to: email,
        subject: "8/30 AFF へご招待。",
        text: `こんにちは ${name} さん！\n\nあなたを以下のパーティーにご招待します🎉\n\n`,
        html: `
          <p>こんにちは ${name} さん！</p>
          <p>あなたを以下のパーティーにご招待します 🎉</p>
          <p>
            <img src="cid:invite@aff" alt="イベントフライヤー"
            style="max-width:400px; border:1px solid #ccc;" />
          </p>
          <!-- APIでも画像をBase64で送れる。埋め込みする場合はattachmentsを使う -->
        `
      })
    });

    const data = await response.json();
    console.log("Maileroo response:", data);

    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(500).json({ success: false, error: data });
    }

  } catch (error) {
    console.error("メール送信エラー:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// エラー補足
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Maileroo API Server is running on http://localhost:${port}`);
});
