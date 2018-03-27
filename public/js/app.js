import $ from 'jquery';
import _ from 'lodash';

//firebase//

import firebase from 'firebase';

//firebase//

$(document).ready(function() {

  const APP_ID = "5dc264ca";
  const APP_KEY = "9d31b419ea348af62637409eebc94396";
  const BASE_URL = "https://api.edamam.com/search";

  //firebase//

  var config = {
    apiKey: "AIzaSyACOWcZ9ZBeM0CQEcNfISmxXt0VWPqAh6A",
    authDomain: "recipe-finder-3b10c.firebaseapp.com",
    databaseURL: "https://recipe-finder-3b10c.firebaseio.com",
    projectId: "recipe-finder-3b10c",
    storageBucket: "recipe-finder-3b10c.appspot.com",
    messagingSenderId: "1036098729656"
  };

  //firebase

  firebase.initializeApp(config);
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var providerData = user.providerData;
      //console.log(email);
    } else {
      //no user is signed in
    }
  });

  var firebaseAuth = firebase.auth();
	var provider = new firebase.auth.GoogleAuthProvider();
	const db = firebase.database();
	var ref = db.ref("recipeList");
  var rootRef = firebase.database().ref().child("recipeList");
  var currentRecipeKey;

  const txtEmail = document.getElementById('email-input');
  const txtPassword = document.getElementById('password-input');
  const btnLogin = document.getElementById('login-button');

  var userId;


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      userId = user.uid;
    } else {
      //no user is signed in
    }
  });

  //firebase


  let App = {

    recipeArray: [],
    savedRecipeArray: [],

    init: function() {
      App.bindEvents();
      App.populateSavedRecipeList();
      //App.userDisplay();
    },

    bindEvents: function() {
      $(".get-data-button").on("click", App.getRecipeViaIngredient);
      $(document).on("click", ".recipes > li", App.showRecipeDetails);
      $(document).on("click", ".saved-recipes > li", App.showSavedRecipeDetails);

      $(document).on("click", "input.save-recipe-button", App.saveRecipeToList);

      $(document).on("click", "input.remove-recipe-button", App.removeRecipeFromList);

      $(".login-button").on("click", App.logIn);
      $(".sign-up-button").on("click", App.signUp);
      $(".new-recipe-button").on("click", App.toggleToForm);

      $(document).on("click", "input.add-ingredient-button", App.addIngredient);

      $(".modal-button").on("click", App.logInModalOpen);
      $(".close").on("click", App.logInModalClose);



    },

    userDisplay: function() {

      var currentUser = firebase.auth().currentUser;
      var currentUserEmail = currentUser.email;
      $(".user-email").text(currentUserEmail);

    //  console.log(currentUserEmail);

    },

    logInModalOpen: function() {

      var modal = document.getElementById('myModal');
      modal.style.display = "block";

    },

    logInModalClose: function() {

      var modal = document.getElementById('myModal');
      modal.style.display = "none";

    },

    logIn: function() {

      var email = $(".email-input").val();
      var password = $(".password-input").val();
      const auth = firebase.auth();
      const promise = auth.signInWithEmailAndPassword(email, password);
      promise.catch(e => console.log(e.message));

      var user = firebase.auth().currentUser;

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          App.populateSavedRecipeList();
          //take out
          //console.log(user);
          //take out
        } else {
          //no user is signed in
        }
      });
      },



    signUp: function() {

      //check for real email

      var userName = $(".sign-up-name-input").val();
      var email = $(".sign-up-email-input").val();
      var password = $(".sign-up-password-input").val();
      const auth = firebase.auth();
      const promise = auth.createUserWithEmailAndPassword(email, password);
      promise.catch(e => console.log(e.message));

      firebase.auth().onAuthStateChanged(function(user) {

                if (user) {

                   // Updates the user attributes:

                  user.updateProfile({ // <-- Update Method here

                    displayName: userName,
                  //  photoURL: "https://example.com/jane-q-user/profile.jpg"

                  }).then(function() {
                    // Profile updated successfully!
                    //  "NEW USER NAME"

                    var displayName = user.displayName;
                    // "https://example.com/jane-q-user/profile.jpg"
                  //  var photoURL = user.photoURL;

                  }, function(error) {
                    // An error happened.
                  });

                }
    });


    //console.log(user.displayName);

    },

    getRecipeViaIngredient: function() {
      const ingredient = $(".ingredient-input").val();
      const request = App.requestRecipe({
        q: ingredient
      });
      request.done(App.formatResponse);
      request.done(App.renderRecipe);
    },

    requestRecipe: function(extraParameters) {
      let urlParameters = {
        app_id: APP_ID,
        app_key: APP_KEY,
        to: 1000
      };
      _.extend(urlParameters, extraParameters);
      return $.ajax(BASE_URL, {
        dataType: "json",
        data: urlParameters
      });
    },

    formatResponse: function(response) {
      App.recipeArray = [];
      _.each(response.hits, function(child) {
        const recipeObject = {
        //  recipe: child.recipe,
          calories: child.recipe.calories,
          image: child.recipe.image,
          ingredients: child.recipe.ingredientLines,
          title: child.recipe.label,
          instructionsLink: child.recipe.url,
          recipeSource: child.recipe.source,
          userCreated: false
        };
        App.recipeArray.push(recipeObject);
      });
    },

    toggleToForm: function() {

      App.clearDetail();

      $(".detail").append(`<div class="recipe-detail"></div>`);
      $(".recipe-detail").append(`<div class="title"></div>`);


      $(".recipe-detail").append(`<textarea rows="4" cols="50" class="instructions"></textarea>`);


      $(".recipe-detail").append(`<ul class="ingredients"></ul>`);
      $(".recipe-detail").append(`<div class="detail-button"</div>`);
      $(".title").append(`<input type="text" class="recipe-title" placeholder="Enter a Title. ">`);

      $(".instructions").append(`<input type="text" class="recipe-instructions" placeholder="Enter Your Instructions. ">`);

      $(".ingredients").append(`<input type="text" class="recipe-ingredients" placeholder="Enter an Ingredient. ">`);
      $(".ingredients").append(`<input type="button" class="add-ingredient-button" value="Add Ingredient">`);
      $(".detail-button").append(`<input type="button" class="save-recipe-button" value="Save This Recipe">`);
      $(".detail-button").append(`<input type="button" class="remove-recipe-button" value="Remove This Recipe From Your List">`);
    },

    toggleToDetail: function() {

      App.clearDetail();

      $(".detail").append(`<div class="recipe-detail"></div>`);
      $(".recipe-detail").append(`<div class="title"></div>`);
      $(".recipe-detail").append(`<div class="image"><img id="recipe-image"></div>`);
      $(".recipe-detail").append(`<div class="instructions"></div>`);
      $(".recipe-detail").append(`<ul class="ingredients"></ul>`);
      $(".recipe-detail").append(`<div class="detail-button"</div>`);
      $(".detail-button").append(`<input type="button" class="save-recipe-button" value="Save This Recipe">`);
      $(".detail-button").append(`<input type="button" class="remove-recipe-button" value="Remove This Recipe From Your List">`);

    },


    //Add ingredients

    addIngredient: function() {

      $(".recipe-detail ul").append(`<li>${$(".recipe-ingredients").val()}</li>`);

    },

    //remove elements from recipe detail
    clearDetail: function() {

      $(".recipe-detail").remove();

    },

    renderRecipe: function(response) {
      $(".recipes li").remove();
      var recipes = App.recipeArray;
      recipes.map(function(x) {
        var recipe_name = x.title;
        var recipesMarkup = `<li>${recipe_name}</li>`;
        $(".recipes").append(recipesMarkup);
      });

    },

    showRecipeDetails: function() {

      //App.clearDetail();
      App.toggleToDetail();

      const recipe_name = $(this).text();
      const recipe = _.find(App.recipeArray, {
        title: recipe_name
      });
      const ingredients = (recipe.ingredients);
      const ingredientForm = $.each(ingredients, function(x) {
        $(".recipe-detail ul").append(`<li>${this}</li>`);
      });
      $("#recipe-image").attr('src', recipe.image);
      $(".instructions").append(
        `<a href="${recipe.instructionsLink}" target="_blank">For more information follow this link to the full recipe at ${recipe.recipeSource}</a>`
      );
      $(".title").append(`<p>${recipe.title}</p>`);
    },

    showSavedRecipeDetails: function() {

      App.toggleToDetail();

      const recipe_name = $(this).text();
      var recipe_id = $(this).attr('id');

      //firebase

      firebase.database().ref('/recipeList').on('value', function(snapshot) {

        var returnArr = [];

        snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
        });

        const recipe = _.find(returnArr, {
          key: recipe_id
        });

        currentRecipeKey = recipe.key;

        //console.log(recipe.recipe.userCreated);

        if(recipe.recipe.userCreated == false){

        const ingredients = (recipe.recipe.ingredients);
        const ingredientForm = $.each(ingredients, function(x) {
          $(".recipe-detail ul").append(`<li>${this}</li>`);
        });
        $("#recipe-image").attr('src', recipe.recipe.image);
        $(".instructions").append(
          `<a href="${recipe.recipe.instructionsLink}" target="_blank">For more information follow this link to the full recipe at ${recipe.recipe.recipeSource}</a>`
        );
        $(".title").append(`<p>${recipe.recipe.title}</p>`);
        $(".instructions-text").append(`<p>${recipe.recipe.instructions}`);

      } else {

        const ingredients = (recipe.recipe.ingredients);
        const ingredientForm = $.each(ingredients, function(x) {
          $(".recipe-detail ul").append(`<li>${this}</li>`);
        });
        $("#recipe-image").attr('src', recipe.recipe.image);
        $(".title").append(`<p>${recipe.recipe.title}</p>`);
        $(".instructions").append(`<p>${recipe.recipe.instructions}`);

      };



        //console.log(recipe);

      });
    },

    saveRecipeToList: function() {

console.log($(".instructions").val());


      const recipe_name = $(".title p").text();
      const recipe = _.find(App.recipeArray, {
        title: recipe_name
      });

      //console.log(recipe);

      if (typeof recipe === 'undefined'){

        var recTitle = $(".recipe-title").val();
        var ingredientsArr = [];

        $(".ingredients li").each(function(i)
      {
        ingredientsArr.push($(this).text());
      });

          var data = {
            name: recTitle,
          recipe: {
            title: $(".recipe-title").val(),
            ingredients: ingredientsArr,
            instructions: $(".instructions").val(),
            recipeSource: userId,
            userCreated: true
          },
          userWhoSaved: userId
        }

         var newRef = ref.push(data);
         var newID = newRef.key;

      } else {

        const recipe_name = $(".title p").text();
        const recipe = _.find(App.recipeArray, {
          title: recipe_name
        });



      //firebase//

      var data = {
        name: recipe_name,
        recipe: recipe,
        userWhoSaved: userId
      }

        var newRef = ref.push(data);
        var newID = newRef.key;

      //firebase//
    }
  },

     removeRecipeFromList: function() {

       const recipe_name = $(".title p").text();

      var currentRecipe = ref.child(currentRecipeKey);

      currentRecipe.remove();

      App.toggleToForm();
    },

    populateSavedRecipeList: function() {

      firebase.database().ref('/recipeList').on('value', function(snapshot) {
        App.snapshotToArray(snapshot);
      });
    },

    snapshotToArray: function(snapshot) {

      var returnArr = [];

      snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();
      item.key = childSnapshot.key;

      //console.log(item.userWhoSaved);

      if (item.userWhoSaved === userId) {
      returnArr.push(item)};


      });
      App.renderList(returnArr);
      return returnArr;

    },

    renderList: function(returnArr) {

      App.userDisplay();

    $(".saved-recipes li").remove();
        var savedRecipes = returnArr;
        savedRecipes.map(function(x) {

          var recipe_name = x.name;
          var recipe_key = x.key;
          var recipesMarkup = `<li id=${recipe_key}>${recipe_name}</li>`;
            $(".saved-recipes").append(recipesMarkup);
          });
        }

  };
  App.init();
});
