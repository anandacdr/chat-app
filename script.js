document.addEventListener("DOMContentLoaded", function () {
  const usersContainer = document.getElementById("user-list");
  const chatContainer = document.getElementById("chat-box");
  let senderName = "";
  let receiverName = "";

  function fetchUserList() {
    fetch("/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user list");
        }
        return response.json();
      })
      .then((users) => {
        renderUserList(users);
        loadMessages(); // Call loadMessages after renderUserList
      })
      .catch((error) => {
        console.error("Error fetching user list: ", error);
      });
  }

  function updateUsersJson(receiverName) {
    const usersPath = path.join(__dirname, "users.json");
    fs.readFile(usersPath, "utf8", (readErr, data) => {
      if (readErr) {
        console.error(readErr);
        return;
      }
      try {
        let users = JSON.parse(data);
        if (!users.find((user) => user.name === receiverName)) {
          users.push({ name: receiverName });
          fs.writeFile(
            usersPath,
            JSON.stringify(users, null, 2),
            (writeErr) => {
              if (writeErr) {
                console.error(writeErr);
              } else {
                console.log("Users updated successfully");
              }
            }
          );
        }
      } catch (parseErr) {
        console.error(parseErr);
      }
    });
  }

  function renderUserList(users) {
    usersContainer.innerHTML = "";
    users.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = user.name;
      // Add data attributes for sender and receiver
      listItem.setAttribute("data-sender", senderName);
      listItem.setAttribute("data-receiver", user.name);
      listItem.addEventListener("click", () => {
        receiverName = user.name;
        document.getElementById("receiver-name").value = receiverName;
        loadMessages(); // Load messages for the selected receiver
      });
      usersContainer.appendChild(listItem);
    });
  }

  fetchUserList();

  function renderMessages(messages) {
    chatContainer.innerHTML = "";
    messages.forEach((message) => {
      const div = document.createElement("div");
      div.classList.add("chat-message");
      if (message.sender === senderName) {
        div.classList.add("sender-message");
      } else {
        div.classList.add("receiver-message");
      }
      div.innerHTML = `
        <span class="sender-name">${message.sender}:</span>
        <span class="message-text">${message.text}</span>
        <span class="message-date">${formatDate(message.date)}</span>
      `;
      chatContainer.appendChild(div);
    });
  }

  function sendMessage() {
    senderName = document.getElementById("sender-name").value.trim();
    receiverName = document.getElementById("receiver-name").value.trim();
    const inputField = document.getElementById("message-input");
    const messageText = inputField.value.trim();
    if (messageText !== "" && senderName !== "" && receiverName !== "") {
      const message = {
        sender: senderName,
        receiver: receiverName,
        text: messageText,
        date: new Date().toISOString(),
      };
      console.log("Sending message:", message);
      saveMessage(message);
      inputField.value = "";
      document.getElementById("receiver-name").value = "";
    } else {
      console.log("Message, sender name, or receiver name is empty");
    }
  }

  function saveMessage(message) {
    fetch("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((messages) => {
        renderMessages(messages);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        // Optionally, you can inform the user about the error here
      });
  }

  document.getElementById("send-button").addEventListener("click", sendMessage);
  

  function loadMessages() {
    fetch(`/messages?receiver=${receiverName}`) // Fetch messages for the selected receiver
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((messages) => {
        renderMessages(messages);
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
      });
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString(undefined, options);
  }

  document.getElementById("send-button").addEventListener("click", sendMessage);
  document
    .getElementById("message-input")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
});
