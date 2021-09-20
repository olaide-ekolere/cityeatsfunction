const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');
const db = admin.firestore();

exports.handler = async (req, res) => {
    cors(req, res, async () => {
        //check environment variable
        //fetch variables from request body
        var statusCode = 400;
        try {
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
            const querySnapshot = await db.collection(collection.restaurantCollection)
                .doc(id).get();
            if (!querySnapshot.exists) {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            const restaurant = querySnapshot.data();
            restaurant.id = querySnapshot.id;
            res.status(200).send(restaurant);
            return Promise.resolve('Operation Successful');
        } catch (error) {
            console.log('Error: ', error);
            res.status(statusCode).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};
