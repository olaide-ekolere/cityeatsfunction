const admin = require('firebase-admin');
const collection = require('../utils/collections');

const db = admin.firestore();

exports.onCreateHandler = async (user) => {
    try {
        await db.runTransaction(async t => {
            const dashboardRef = db.collection(collection.settings)
                .doc(collection.dashboard);
            const dashboardSnapshot = await t.get(dashboardRef);
            const dashboard = dashboardSnapshot.data();
            dashboard.users += 1;
            const userRef = db.collection(collection.userCollection).doc(user.uid);
            const userObject = {
                displayName: user.displayName,
                email: user.email,
                suspened: false,
                createdOn: new Date().toString('en-US'),
                createdOnValue: new Date().getTime(),
                updatedOn: new Date().toString('en-US'),
                updatedOnValue: new Date().getTime()
            };
            t.set(userRef, userObject);
            t.set(dashboardRef, dashboard);
        });
    } catch (error) {
        console.log('Error: ', error);
        //return Promise.reject(new Error(error));
    }
};