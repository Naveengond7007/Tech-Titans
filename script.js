document.addEventListener('DOMContentLoaded', function () {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const recipeDisplay = document.getElementById('recipe-display');

    // Initialize with a welcome message
    addBotMessage("Hello! I'm your Recipe Assistant. Ask me about recipes or ingredients.");

    // Send message when button is clicked
    sendBtn.addEventListener('click', sendMessage);

    // Send message when Enter key is pressed
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addUserMessage(message);
        userInput.value = '';

        // Send to backend
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
            .then(response => response.json())
            .then(data => {
                addBotMessage(data.response);

                // If the response contains recipe names, make them clickable
                if (data.response.includes("recipes:")) {
                    const recipeNames = data.response.split("recipes:")[1].split(",");
                    recipeNames.forEach(name => {
                        const trimmedName = name.trim();
                        if (trimmedName) {
                            // Search for this recipe when clicked
                            setTimeout(() => {
                                const lastBotMessage = document.querySelector('.chat-box .bot-message:last-child');
                                const recipeLink = document.createElement('span');
                                recipeLink.textContent = trimmedName;
                                recipeLink.style.color = '#ff6b6b';
                                recipeLink.style.cursor = 'pointer';
                                recipeLink.style.margin = '0 5px';
                                recipeLink.style.textDecoration = 'underline';
                                recipeLink.addEventListener('click', () => {
                                    searchRecipeDetails(trimmedName);
                                });
                                lastBotMessage.appendChild(recipeLink);
                            }, 100);
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                addBotMessage("Sorry, I'm having trouble connecting to the server.");
            });
    }

    function searchRecipeDetails(recipeName) {
        fetch(`/api/recipes/search?q=${encodeURIComponent(recipeName)}`)
            .then(response => response.json())
            .then(recipes => {
                if (recipes.length > 0) {
                    displayRecipe(recipes[0]);
                } else {
                    addBotMessage(`Sorry, I couldn't find details for "${recipeName}".`);
                }
            });
    }

    function displayRecipe(recipe) {
        recipeDisplay.innerHTML = `
            <div class="recipe-card">
                <h3>${recipe.name}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> Prep: ${recipe.prep_time} mins</span>
                    <span><i class="fas fa-fire"></i> Cook: ${recipe.cook_time} mins</span>
                    <span><i class="fas fa-utensils"></i> Serves: ${recipe.servings}</span>
                    <span><i class="fas fa-tag"></i> ${recipe.category}</span>
                </div>
                
                <h4>Ingredients</h4>
                <ul>
                    ${recipe.ingredients.split('\n').map(ing => `<li>${ing}</li>`).join('')}
                </ul>
                
                <h4>Instructions</h4>
                <ol>
                    ${recipe.instructions.split('\n').map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;

        // Scroll to recipe
        recipeDisplay.scrollIntoView({ behavior: 'smooth' });
    }

    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user-message');
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message');
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});