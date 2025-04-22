// Simple user management
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Check authentication status on load
window.onload = function() {
  updateUIBasedOnAuth();
}

function updateUIBasedOnAuth() {
  const authSection = document.getElementById('auth-section');
  const appContainer = document.getElementById('app-container');
  const userNameSpan = document.getElementById('user-name');
  
  if (currentUser) {
    authSection.style.display = 'none';
    appContainer.style.display = 'block';
    userNameSpan.textContent = `Welcome, ${currentUser.name}`;
    loadUserHistory();
  } else {
    authSection.style.display = 'block';
    appContainer.style.display = 'none';
  }
}

function toggleAuth() {
  const loginBox = document.getElementById('login-box');
  const signupBox = document.getElementById('signup-box');
  
  if (loginBox.style.display === 'none') {
    loginBox.style.display = 'block';
    signupBox.style.display = 'none';
  } else {
    loginBox.style.display = 'none';
    signupBox.style.display = 'block';
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch('/auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      updateUIBasedOnAuth();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Error logging in');
  }
}

async function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  if (!name || !email || !password) {
    alert('Please fill all fields');
    return;
  }
  
  try {
    const response = await fetch('/auth.php?action=signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Signup successful! Please login.');
      toggleAuth();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Error signing up');
  }
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    history: []
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  updateUIBasedOnAuth();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateUIBasedOnAuth();
}

async function handlePDFUpload(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + ' ';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return null;
  }
}

async function summarizeText(inputText = null) {
  if (!currentUser) return;
  
  const summaryButton = document.querySelector('button');
  const originalText = summaryButton.textContent;
  summaryButton.textContent = 'Processing...';
  summaryButton.disabled = true;
  
  try {
  
  const text = inputText || document.getElementById('input-text').value;
  if (!text) {
    alert('Please enter some text or upload a PDF to summarize');
    return;
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const words = text.split(/\s+/);
  
  const wordFreq = {};
  words.forEach(word => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sentenceScores = sentences.map(sentence => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    return sentenceWords.reduce((score, word) => {
      word = word.replace(/[^a-z]/g, '');
      return score + (wordFreq[word] || 0);
    }, 0) / sentenceWords.length;
  });

  const numSentences = Math.min(3, sentences.length);
  const topSentences = sentenceScores
    .map((score, idx) => ({ score, sentence: sentences[idx] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
    .map(item => item.sentence);

  const summary = topSentences.join(' ');
  document.getElementById('summary').innerText = summary;
  
  // Save to user history
  saveToHistory(text, summary);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('summary').innerText = 'An error occurred while processing the text.';
  } finally {
    const summaryButton = document.querySelector('button');
    summaryButton.textContent = originalText;
    summaryButton.disabled = false;
  }
}

function saveToHistory(originalText, summary) {
  if (!currentUser) return;
  
  const historyItem = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    originalText: originalText.substring(0, 100) + '...',
    summary
  };
  
  currentUser.history = currentUser.history || [];
  currentUser.history.unshift(historyItem);
  
  // Update users array and localStorage
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  users[userIndex] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  loadUserHistory();
}

function loadUserHistory() {
  const historyContainer = document.getElementById('summary-history');
  historyContainer.innerHTML = '';
  
  if (!currentUser || !currentUser.history) return;
  
  currentUser.history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <small>${item.date}</small>
      <p>${item.summary}</p>
    `;
    historyContainer.appendChild(historyItem);
  });
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    const pdfText = await handlePDFUpload(file);
    if (pdfText) {
      document.getElementById('input-text').value = pdfText;
      summarizeText(pdfText);
    } else {
      alert('Error processing PDF file');
    }
  } else {
    alert('Please upload a PDF file');
  }
}