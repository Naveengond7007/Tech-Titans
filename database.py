from .models import db, Recipe


def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()


def add_recipe(name, ingredients, instructions, prep_time=0, cook_time=0, servings=1, category="Main"):
    new_recipe = Recipe(
        name=name,
        ingredients=ingredients,
        instructions=instructions,
        prep_time=prep_time,
        cook_time=cook_time,
        servings=servings,
        category=category
    )
    db.session.add(new_recipe)
    db.session.commit()
    return new_recipe


def get_all_recipes():
    return [recipe.to_dict() for recipe in Recipe.query.all()]


def search_recipes(query):
    results = Recipe.query.filter(
        (Recipe.name.ilike(f'%{query}%')) |
        (Recipe.ingredients.ilike(f'%{query}%')) |
        (Recipe.category.ilike(f'%{query}%'))
    ).all()
    return [recipe.to_dict() for recipe in results]


def get_recipe_by_id(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    return recipe.to_dict() if recipe else None
