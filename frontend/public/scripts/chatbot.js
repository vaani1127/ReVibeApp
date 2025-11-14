document.addEventListener('DOMContentLoaded', () => {
    // Get chatbot elements
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');

    // Function to add a message to the chat UI
    function addMessage(message, sender) {
        if (!chatbotMessages) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('p-3', 'rounded-lg', 'max-w-xs', 'mb-2');
        
        if (sender === 'user') {
            messageElement.classList.add('bg-blue-500', 'text-white', 'self-end', 'rounded-br-none');
        } else {
            messageElement.classList.add('bg-gray-200', 'text-gray-800', 'self-start', 'rounded-bl-none');
        }
        
        messageElement.textContent = message;
        chatbotMessages.appendChild(messageElement);
        // Scroll to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // --- Event Listeners ---

    // Toggle chatbot window
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            if(chatbotWindow) chatbotWindow.classList.toggle('hidden');
        });
    }

    // Close chatbot window
    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            if(chatbotWindow) chatbotWindow.classList.add('hidden');
        });
    }

    // Handle sending a message
    if (chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!chatbotInput) return;
            const message = chatbotInput.value.trim();
            if (!message) return;

            // 1. Display user's message immediately
            addMessage(message, 'user');
            chatbotInput.value = ''; // Clear input

            // 2. Send message to backend API
            try {
                // Get the auth token (assuming it was stored at login)
                const token = localStorage.getItem('authToken');
                
                const response = await fetch('/api/chatbot/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Send token for protected routes
                    },
                    body: JSON.stringify({ query: message })
                });

                const data = await response.json();

                // 3. Display bot's response
                if (response.ok && data.success) {
                    addMessage(data.reply, 'bot');
                } else {
                    addMessage(data.message || 'Sorry, I encountered an error.', 'bot');
                }

            } catch (error) {
                console.error('Chatbot request failed:', error);
                addMessage('Sorry, I seem to be offline. Please try again later.', 'bot');
            }
        });
    }

    // Add a default welcome message
    if(chatbotMessages && chatbotMessages.children.length === 0) {
        setTimeout(() => {
            addMessage('Hello! How can I help you today with your HR questions?', 'bot');
        }, 1000);
    }
});