function renderMessages(messages) {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    messages.forEach(message => {
      const div = document.createElement('div');
      div.textContent = `${message.sender}: ${message.text}`;
      chatBox.appendChild(div);
    });
  }
  
  function sendMessage() {
    const inputField = document.getElementById('message-input');
    const messageText = inputField.value.trim();
    if (messageText !== '') {
      const message = {
        sender: 'Me',
        text: messageText
      };
      saveMessage(message);
      inputField.value = '';
    }
  }
  
  function saveMessage(message) {
    fetch('/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
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
  
  loadMessages();
  