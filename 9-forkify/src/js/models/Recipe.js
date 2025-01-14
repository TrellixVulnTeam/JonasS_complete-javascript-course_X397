import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title; // following path from api object
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            console.log(error);
            alert('Something went wrong :(');
        }
    }

    calcTime() {
        // Assuming that we need 15mins for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods *15;
    }

    calcServings() {
        this.servings = 4;
    }


    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'lbs'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {  // .map to loop[ through the items]
            // 1 uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
        });

        // 2 remove items in parenthesis
        ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

        // 3 Parse ingredients into count, unit and ingredients
        const arrIng = ingredient.split(' ');
        const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));

        let objIng;
        if (unitIndex > -1) {
            // there is a unit
            // ex. 4 1/2 cups, arrCount is [4, 1/2]
            // ex. 4 cups, arrCount is [4]
            const arrCount = arrIng.slice(0, unitIndex);

            let count;
            if (arrCount.length === 1) {
                count = eval(arrIng[0].replace('-', '+'));
            } else {
                count = eval(arrIng.slice(0, unitIndex).join('+'));
            }

            objIng = {
                count,  // in es6 means count = count
                unit: arrIng[unitIndex],
                ingredient: arrIng.slice(unitIndex + 1).join(' ')
            };

        } else if (parseInt(arrIng[0], 10)) {
            // there is NO unit, but first element is a number
            objIng = {
                count: parseInt(arrIng[0], 10),
                unit: '',
                ingredient: arrIng.slice(1).join(' ')
            }

        } else if (unitIndex === -1) {
            // there is NO unit and NO number in first position
            objIng = {
                count: 1,
                unit: '',
                ingredient  
            }
        }

        return objIng;
    });
    this.ingredients = newIngredients;
    }

    updateServings (type) {
        // servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1; // dec = decreasing
        // ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings)  // with *= operator, same as: ing.count = ing.count * (
        });

        this.servings = newServings;
    }
}
