const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('chat.db');

app.use(cors());
app.use(express.json());

// チャットメッセージを保存する関数
const saveChatMessage = (message) => {
  const { id, title, text, date, username, replies } = message;

  // データベースへのクエリを実行
  db.run(
    'INSERT INTO chat_messages (id, title, text, date, username,replies) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, text, date, username,replies],
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('メッセージが保存されました。');
      }
    }
  );
};

// POSTリクエストを処理してチャットメッセージを保存するエンドポイント
app.post('/api/chat', (req, res) => {
  const message = req.body;

  // メッセージをデータベースに保存
  saveChatMessage(message);

  res.sendStatus(200); // レスポンスとして成功を返す
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('サーバーエラーが発生しました。');
});

// サーバーを起動して待ち受けるポートを指定
const port = 5000;
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました。`);
});
