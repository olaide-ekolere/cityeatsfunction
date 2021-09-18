const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({projectId: 'city-eats-983bd'});


//User Functions
const signUp = require('./user/create');
exports.signUp = functions.https.onRequest(signUp.handler);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
