const admin = require('firebase-admin');
const collection = require('../utils/collections');

const db = admin.firestore();

exports.onCreateHandler = async (user) => {
    try {
        await db.collection(collection.userCollection).doc(user.uid).set({
            displayName: user.displayName,
            email: user.email,
            suspened: false,
            createdOn: new Date().toString('en-US'),
            createdOnValue: new Date().getTime(),
            updatedOn: new Date().toString('en-US'),
            updatedOnValue: new Date().getTime()
        });
    } catch (error) {
        console.log('Error: ', error);
        //return Promise.reject(new Error(error));
    }
};