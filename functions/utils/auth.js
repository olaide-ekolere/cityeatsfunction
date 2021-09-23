
const admin = require('firebase-admin');
const collection = require('../utils/collections');

//const db = admin.firestore();

exports.hasAccess = async (db, idToken) => {
    const claims = await admin.auth().verifyIdToken(idToken, true);
    return Promise.resolve(claims);
};

exports.isAdmin =  (email) => {
    return email !== undefined && email ===  "olaide@cityeats.com";
};
/*
exports.hasBusinessAccess = async (db, environment, idToken) => {
    const claims = await admin.auth().verifyIdToken(idToken, true);
    if (claims.email_verified && claims.email_verified) {
        return Promise.resolve(claims);
    }
    else {
        return Promise.reject(new Error('Email must be verified'));
        //return Promise.resolve(claims);
    }
};

exports.hasAdminAccess = async (db, environment, idToken, moduleName) => {
    const claims = await admin.auth().verifyIdToken(idToken, true);
    return Promise.resolve(claims);
};
*/