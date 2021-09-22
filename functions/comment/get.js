const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');
const db = admin.firestore();

exports.handler = async (req, res) => {
    cors(req, res, async () => {
        //check environment variable
        //fetch variables from request body

        const idToken = req.header('FIREBASE_AUTH_TOKEN');
        var statusCode = 400;
        try {
            if (idToken === undefined) {
                statusCode = 403;
                throw new Error('Unauthorized Access');
            }
            const apiKey = req.header('x-api-key');
            if (apiKey !== collection.apiKey) {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            const id = req.query.id;
            if (typeof id !== 'string') {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            const claims = await auth.hasAccess(db, idToken,);

            const querySnapshot = await db.collection(collection.restaurantReviewCollection)
            .doc(id).collection(collection.database).doc(claims.uid).get();
            if (!querySnapshot.exists) {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            const comment = !querySnapshot.exists? {} : querySnapshot.data();
            comment.id = querySnapshot.id;
            res.status(200).send(comment);
            return Promise.resolve('Operation Successful');
        } catch (error) {
            console.log('Error: ', error);
            res.status(statusCode).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};
