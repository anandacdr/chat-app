// Function to fetch list of users from the server
function fetchUserList() {
  fetch('/users')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user list');
      }
      return response.json();
    })
    .then(users => {
      renderUserList(users);
    })
    .catch(error => {
      console.error('Error fetching user list: ', error);
    });
}

// Render the list of users in the sidebar
function renderUserList(users) {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  users.forEach(user => {
    const listItem = document.createElement('li');
    listItem.textContent = user.name;
    userList.appendChild(listItem);
  });
}

// Call fetchUserList when the page loads
document.addEventListener('DOMContentLoaded', fetchUserList);

// Function to render messages in the chat box
function renderMessages(messages) {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  messages.forEach(message => {
    const div = document.createElement('div');
    div.classList.add('chat-message');
    if (message.sender === senderName) {
      div.classList.add('sender-message');
    } else {
      div.classList.add('receiver-message');
    }
    div.innerHTML = `
      <span class="sender-name">${message.sender}:</span>
      <span class="message-text">${message.text}</span>
      <span class="message-date">${formatDate(message.date)}</span>
    `;
    chatBox.appendChild(div);
  });
}

// Function to send a message
function sendMessage() {
  const senderName = document.getElementById('sender-name').value.trim();
  const receiverName = document.getElementById('receiver-name').value.trim();
  const inputField = document.getElementById('message-input');
  const messageText = inputField.value.trim();
  if (messageText !== '' && senderName !== '' && receiverName !== '') {
    const message = {
      sender: senderName,
      receiver: receiverName,
      text: messageText,
      date: new Date().toISOString(),
    };
    saveMessage(message);
    inputField.value = '';
    // Clear the receiver input field
    document.getElementById('receiver-name').value = '';
  }
}

// Function to save a message
function saveMessage(message) {
  fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(messages => {
      renderMessages(messages);
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
}

// Function to load messages
function loadMessages() {
  fetch('/messages')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(messages => {
      renderMessages(messages);
    })
    .catch(error => {
      console.error('Error loading messages:', error);
    });
}

// Function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString(undefined, options);
}

loadMessages();
