// ============================================
// MADY AI - FRONTEND LOGIC
// Premium UI/UX & Interaction Handler
// ============================================

const state = {
    currentChatId: null,
    chats: [],
    messages: [],
    isTyping: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    setupEventListeners();

    // Check if user was previously in chat
    if (localStorage.getItem('mady_active_view') === 'chat') {
        startChat();
    }
});

// ============================================
// NAVIGATION & UI
// ============================================

function startChat() {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('chat-app').classList.add('active');
    localStorage.setItem('mady_active_view', 'chat');

    if (!state.currentChatId) {
        startNewChat();
    }
}

function showLanding() {
    document.getElementById('chat-app').classList.remove('active');
    document.getElementById('landing-page').classList.add('active');
    localStorage.setItem('mady_active_view', 'landing');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function openSettings() {
    document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function usePrompt(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    input.focus();
    autoResize(input);
    handleUserInput();
}

// ============================================
// CHAT LOGIC
// ============================================

function startNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        title: 'New Conversation',
        messages: [],
        timestamp: new Date().toISOString()
    };

    state.chats.unshift(newChat);
    state.currentChatId = chatId;
    state.messages = [];

    saveChats();
    renderHistory();
    clearChatUI();

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('active');
}

async function handleUserInput() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();

    if (!message || state.isTyping) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Add User Message
    addMessage(message, 'user');

    // Hide Welcome Screen
    document.querySelector('.chat-welcome').style.display = 'none';

    // Set Typing State
    state.isTyping = true;
    const typingId = showTypingIndicator();

    try {
        // Prepare context
        const context = state.messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        // Call Backend
        const response = await fetch('http://localhost:3000/api/intelligent-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                conversationHistory: context
            })
        });

        // Remove Typing Indicator
        removeMessage(typingId);

        // Create AI Message Container
        const aiMessageId = addMessage('', 'assistant');
        const aiContentDiv = document.getElementById(`msg-content-${aiMessageId}`);

        // Handle Streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            fullResponse += content;
                            aiContentDiv.innerHTML = marked.parse(fullResponse);
                            // Highlight code blocks
                            aiContentDiv.querySelectorAll('pre code').forEach((block) => {
                                hljs.highlightElement(block);
                            });
                            scrollToBottom();
                        }
                    } catch (e) {
                        console.error('Parse error', e);
                    }
                }
            }
        }

        // Save Message
        state.messages.push({ role: 'assistant', content: fullResponse });
        updateChatHistory(state.currentChatId, state.messages);

    } catch (error) {
        removeMessage(typingId);
        addMessage("I'm having trouble connecting right now. Please try again.", 'assistant');
    } finally {
        state.isTyping = false;
    }
}

// ============================================
// RENDERING
// ============================================

function addMessage(content, role) {
    const id = Date.now();
    const container = document.getElementById('chat-messages');

    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user-message' : 'mady-message'}`;
    div.id = `msg-${id}`;

    const avatar = role === 'user'
        ? `<div class="avatar user-avatar"><i class="fas fa-user"></i></div>`
        : `<div class="avatar mady-avatar"><i class="fas fa-robot" style="color: white;"></i></div>`;

    div.innerHTML = `
        ${role === 'assistant' ? avatar : ''}
        <div class="message-content" id="msg-content-${id}">
            ${role === 'user' ? content : ''}
        </div>
        ${role === 'user' ? avatar : ''}
    `;

    container.appendChild(div);
    scrollToBottom();

    if (content) {
        state.messages.push({ role, content });
        updateChatHistory(state.currentChatId, state.messages);
    }

    return id;
}

function showTypingIndicator() {
    const id = Date.now();
    const container = document.getElementById('chat-messages');

    const div = document.createElement('div');
    div.className = 'message mady-message';
    div.id = `msg-${id}`;

    div.innerHTML = `
        <div class="avatar mady-avatar"><i class="fas fa-robot" style="color: white;"></i></div>
        <div class="message-content">
            <i class="fas fa-circle-notch fa-spin"></i> Thinking...
        </div>
    `;

    container.appendChild(div);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(`msg-${id}`);
    if (el) el.remove();
}

function scrollToBottom() {
    const container = document.getElementById('chat-container');
    container.scrollTop = container.scrollHeight;
}

function clearChatUI() {
    document.getElementById('chat-messages').innerHTML = '';
    document.querySelector('.chat-welcome').style.display = 'block';
}

// ============================================
// HISTORY MANAGEMENT
// ============================================

function saveChats() {
    localStorage.setItem('mady_chats', JSON.stringify(state.chats));
}

function loadChatHistory() {
    const saved = localStorage.getItem('mady_chats');
    if (saved) {
        state.chats = JSON.parse(saved);
        renderHistory();
    }
}

function updateChatHistory(chatId, messages) {
    const chatIndex = state.chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
        state.chats[chatIndex].messages = messages;
        // Update title based on first message
        if (messages.length > 0 && state.chats[chatIndex].title === 'New Conversation') {
            state.chats[chatIndex].title = messages[0].content.substring(0, 30) + '...';
        }
        saveChats();
        renderHistory();
    }
}

function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    state.chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = chat.title;
        div.onclick = () => loadChat(chat.id);
        container.appendChild(div);
    });
}

function loadChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChatId = chatId;
    state.messages = chat.messages;

    clearChatUI();

    if (chat.messages.length > 0) {
        document.querySelector('.chat-welcome').style.display = 'none';
        chat.messages.forEach(msg => {
            // Manually add message to UI without pushing to state (already there)
            const id = Date.now() + Math.random();
            const container = document.getElementById('chat-messages');
            const div = document.createElement('div');
            div.className = `message ${msg.role === 'user' ? 'user-message' : 'mady-message'}`;

            const avatar = msg.role === 'user'
                ? `<div class="avatar user-avatar"><i class="fas fa-user"></i></div>`
                : `<div class="avatar mady-avatar"><i class="fas fa-robot" style="color: white;"></i></div>`;

            div.innerHTML = `
                ${msg.role === 'assistant' ? avatar : ''}
                <div class="message-content">
                    ${marked.parse(msg.content)}
                </div>
                ${msg.role === 'user' ? avatar : ''}
            `;

            container.appendChild(div);

            // Highlight code
            div.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
        scrollToBottom();
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('active');
}

// ============================================
// UTILS
// ============================================

function setupEventListeners() {
    // Enter to send
    document.getElementById('user-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
}

function clearChat() {
    if (confirm('Are you sure you want to clear this chat?')) {
        state.messages = [];
        updateChatHistory(state.currentChatId, []);
        clearChatUI();
    }
}

function exportChat() {
    const text = state.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mady-chat-${new Date().toISOString()}.txt`;
    a.click();
}

// ============================================
// FILE UPLOAD HANDLER
// ============================================
async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        input.value = '';
        return;
    }

    // Hide welcome screen
    document.querySelector('.chat-welcome').style.display = 'none';

    // Show file upload message
    const fileMessage = `📎 Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    addMessage(fileMessage, 'user');

    // Show analyzing indicator
    const analyzingId = showTypingIndicator();
    const analyzingMsg = document.getElementById(`msg-content-${analyzingId}`);
    analyzingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing your file...';

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('question', 'Analyze this file and tell me everything about it.');

        // Send to backend
        const response = await fetch('http://localhost:3000/api/analyze-file', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        // Remove analyzing indicator
        removeMessage(analyzingId);

        if (result.success) {
            // Add AI response
            const aiMessageId = addMessage('', 'assistant');
            const aiContentDiv = document.getElementById(`msg-content-${aiMessageId}`);
            aiContentDiv.innerHTML = marked.parse(result.analysis);

            // Highlight code blocks
            aiContentDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // Save to state
            state.messages.push({
                role: 'assistant',
                content: result.analysis
            });
            updateChatHistory(state.currentChatId, state.messages);
        } else {
            addMessage(`❌ Error analyzing file: ${result.error}`, 'assistant');
        }

    } catch (error) {
        removeMessage(analyzingId);
        addMessage('❌ Failed to upload file. Please try again.', 'assistant');
        console.error('File upload error:', error);
    }

    // Clear input
    input.value = '';
}

// ============================================
// VOICE INPUT HANDLER
// ============================================
let recognition = null;
let isListening = false;

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }

    if (isListening) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const voiceBtn = document.getElementById('voice-btn');
    const userInput = document.getElementById('user-input');

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('btn-voice-active');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        userInput.placeholder = 'Listening...';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        userInput.value = finalTranscript + interimTranscript;
        autoResize(userInput);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();

        if (event.error === 'no-speech') {
            userInput.placeholder = 'No speech detected. Try again.';
        } else {
            userInput.placeholder = 'Error: ' + event.error;
        }

        setTimeout(() => {
            userInput.placeholder = 'Ask anything...';
        }, 3000);
    };

    recognition.onend = () => {
        if (isListening) {
            stopVoiceInput();
        }
    };

    recognition.start();
}

function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }

    isListening = false;
    const voiceBtn = document.getElementById('voice-btn');
    const userInput = document.getElementById('user-input');

    voiceBtn.classList.remove('btn-voice-active');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    userInput.placeholder = 'Ask anything...';
}

