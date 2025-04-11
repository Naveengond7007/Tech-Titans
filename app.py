from flask import Flask, request, jsonify
from .database import init_db, add_recipe, get_all_recipes, search_recipes, get_recipe_by_id
from .models import db
import os

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data/recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

# API Routes


@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    return jsonify(get_all_recipes())


@app.route('/api/recipes/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    return jsonify(search_recipes(query))


@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = get_recipe_by_id(recipe_id)
    if recipe:
        return jsonify(recipe)
    return jsonify({'error': 'Recipe not found'}), 404


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').lower()

    # Simple chatbot logic
    if 'hello' in user_message or 'hi' in user_message:
        response = "Hello! I'm your Recipe Assistant. Ask me about recipes or ingredients."
    elif 'recipe' in user_message or 'cook' in user_message:
        # Search for recipes
        results = search_recipes(user_message)
        if results:
            response = f"I found {len(results)} recipes: " + \
                ", ".join([r['name'] for r in results])
        else:
            response = "I couldn't find any recipes matching that. Try something like 'pasta' or 'chicken'."
    else:
        response = "I'm not sure I understand. Ask me about recipes or ingredients."

    return jsonify({'response': response})


if __name__ == '__main__':
    if not os.path.exists('backend/data'):
        os.makedirs('backend/data')
    app.run(debug=True)


