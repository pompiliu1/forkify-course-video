import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
////In JS we can import other thinks than JS files, like images
////  .. -> means the parent folder

////Polyfilling everything else
import 'core-js/stable';
import 'regenerator-runtime/runtime';
////Polifilling async-await
import { async } from 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// } //comming from parcel, not js

// console.log(icons);
// const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
////Loading a Recipe from API

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //window.location -> is the enite url

    if (!id) return;
    recipeView.renderSpinner();
    //0.Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    ////1.Updating bookmarks
    bookmarksView.update(model.state.bookmarks);

    ////2.Loading Recipe
    await model.loadRecipe(id); ////Async function returns a Promise
    ////3.Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1Get search Query
    const query = searchView.getQuery();
    if (!query) return;

    //2.Load search results
    await model.loadSearchResults(query);

    //3.Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4.Render inital pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1.Render New Results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2.Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings(in state)
  model.updateServings(newServings);

  //Updating the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //Update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Spinner loading
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Succes message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change id in the URL(history api)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back;/// if you want to go back

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🎆', err);
    addRecipeView.renderError(err.message);
  }
};

////Publisher Subscriber Pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('welcome');
};
init();
////Listening for load and hashchange Events

////The code below does exactly the code above
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);

////PUBLISHER-SUBSCRIBER PATTERN--> EVENT HANDLER
