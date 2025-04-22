
function addMessage(message, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
  
    if (message === '') return;
  
    addMessage(message, true);
    userInput.value = '';
  
    try {
      let response = await fetch('/chatbot.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Response data:', data);
  
      if (data.status === 'error') {
        addMessage(data.response, false);
        return;
      }
  
      addMessage(data.response, false);
    } catch (error) {
      console.error('Error details:', error);
      addMessage('Server connection error. Please make sure the server is running.', false);
    }
  }
  
  document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  