const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');
const utilities = require('../utils/utilities');
const auth = require('../utils/auth');
const db = admin.firestore();


exports.handler = async (req, res) => {
    cors(req, res, async () => {
        const idToken = req.header('FIREBASE_AUTH_TOKEN');
        let status = 400;

        try {
            if (idToken === undefined) {
                status = 403;
                throw new Error('Unauthorized Access');
            }
            const claims = await auth.hasAccess(db, idToken,);
            if(!auth.isAdmin(claims.email)){
                statusCode = 403;
                throw new Error('Forbidden');
            }
            const dashboardSnapshot = await db.collection('settings').doc('dashboard').get();

            res.status(200).send(dashboardSnapshot.data());
            return Promise.resolve('Operation Successful');
        } catch (error) {
            console.log('Error: ', error);
            res.status(status).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};