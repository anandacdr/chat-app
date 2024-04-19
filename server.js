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
  const usersData = fs.readFileSync('users.json', 'utf8'); // Assuming users data is stored in users.json
  return JSON.parse(usersData);
}

//Here, I have to define the route to fetch list of all users
app.get('/users', (req, res) => {
  const users = getUsers(); // Fetch users from the JSON file
  res.json(users);
});

// Define the route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

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
