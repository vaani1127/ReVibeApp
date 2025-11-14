document.addEventListener('DOMContentLoaded', () => {
    // --- Chatbot UI Toggle ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');

    if (chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('hidden');
        });
    }

    // --- Chatbot Logic ---
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const chatMessages = document.getElementById('chatbot-messages');

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = chatInput.value.trim();
            if (!query) return;

            // 1. Get the token
            const token = localStorage.getItem('ehrms_token');
            if (!token) {
                addMessage('Error: Not authenticated. Please log in.', 'bot');
                return;
            }

            // Add user's message to UI
            addMessage(query, 'user');
            chatInput.value = '';
            chatInput.disabled = true;

            // 2. Set API request options
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 3. Add the token
                },
                body: JSON.stringify({ query })
            };

            // 4. Send query to the backend
            try {
                const response = await fetch('/api/chatbot/query', options);
                const data = await response.json();

                if (response.ok && data.success) {
                    addMessage(data.reply, 'bot');
                } else {
                    addMessage(data.message || "Sorry, I couldn't get a response.", 'bot');
                }
            } catch (error) {
                console.error('Chatbot Error:', error);
                addMessage('An error occurred. Please try again.', 'bot');
            } finally {
                chatInput.disabled = false;
                chatInput.focus();
            }
        });
    }

    function addMessage(text, sender) {
        if (!chatMessages) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('p-3', 'rounded-lg', 'max-w-xs', 'my-2', 'break-words');

        if (sender === 'user') {
            messageElement.classList.add('bg-blue-600', 'text-white', 'self-end', 'ml-auto');
        } else {
            messageElement.classList.add('bg-gray-200', 'text-gray-800', 'self-start', 'mr-auto');
        }

        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});