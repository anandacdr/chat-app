import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the static files (including the HTML) from the same directory
const publicPath = path.join(__dirname, '');
app.use(express.static(publicPath));

// Function to fetch users from a JSON file
function getUsers() {
  const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
  return JSON.parse(usersData);
}

// Route to fetch list of all users
app.get('/users', (req, res) => {
  const users = getUsers();
  res.json(users);
});

// Route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Endpoint to retrieve chat messages
app.get('/messages', (req, res) => {
  fs.readFile(path.join(__dirname, 'chat.json'), 'utf8', (err, data) => {
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
  fs.readFile(path.join(__dirname, 'chat.json'), 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(readErr);
      res.status(500).send('Error reading chat messages');
      return;
    }
    try {
      let messages = JSON.parse(data);
      messages.push(message);
      fs.writeFile(path.join(__dirname, 'chat.json'), JSON.stringify(messages, null, 2), (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          res.status(500).send('Error writing chat messages');
          return;
        }

        // Update users.json with the new receiver
        updateUsersJson(message.receiver);

        res.json(messages);
      });
    } catch (parseErr) {
      console.error(parseErr);
      res.status(500).send('Error parsing chat messages');
    }
  });
});

function updateUsersJson(receiverName) {
  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(readErr);
      return;
    }
    try {
      let users = JSON.parse(data);
      if (!users.find(user => user.name === receiverName)) {
        users.push({ name: receiverName });
        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
          }
        });
      }
    } catch (parseErr) {
      console.error(parseErr);
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message }); // Return specific error message
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});
