const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({projectId: 'city-eats-983bd'});


//User Functions
const signUp = require('./user/create');
exports.signUp = functions.https.onRequest(signUp.handler);

const signIn = require('./user/read');
exports.signIn = functions.https.onRequest(signIn.handler);

const refreshToken = require('./user/refresh_token');
exports.refreshToken = functions.https.onRequest(refreshToken.handler);



const userTriggers = require('./user/triggers');
exports.onCreateUserHandler = functions.auth.user().onCreate(userTriggers.onCreateHandler);


//Restaurant
const createRestaurant = require('./restaurant/create');
exports.createRestaurant = functions.https.onRequest(createRestaurant.handler);

const getRestaurants = require('./restaurant/read');
exports.getRestaurants = functions.https.onRequest(getRestaurants.handler);

const restaurantById = require('./restaurant/get');
exports.restaurantById = functions.https.onRequest(restaurantById.handler);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
