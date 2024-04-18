import express from 'express';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint to retrieve chat messages
app.get('/messages', (req, res) => {
  fs.readFile('chat.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading chat messages');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to store a new chat message
app.post('/messages', (req, res) => {
  const message = req.body;
  fs.readFile('chat.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading chat messages');
      return;
    }
    const messages = JSON.parse(data);
    messages.push(message);
    fs.writeFile('chat.json', JSON.stringify(messages), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error writing chat messages');
        return;
      }
      res.json(messages);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
