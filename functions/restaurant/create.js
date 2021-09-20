const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');
const utilities = require('../utils/utilities');
const auth = require('../utils/auth');
const db = admin.firestore();


exports.handler = async (req, res) => {
    cors(req, res, async () => {
        const idToken = req.header('FIREBASE_AUTH_TOKEN');
        const env = req.header('ENVIRONMENT');
        let status = 400;

        try {
            if (idToken === undefined) {
                status = 403;
                throw new Error('Unauthorized Access');
            }
            let name = req.body.name;
            let about = req.body.about;
            const claims = await auth.hasAccess(db, idToken,);
            if (typeof name !== 'string' || utilities.trimSpaces(name).length < 2) {
                throw new Error('Restaurant Name is must be at least 2 characters');
            }
            if (typeof about !== 'string' || utilities.trimSpaces(about).length < 2) {
                throw new Error('Restaurant About is must be at least 2 characters');
            }

            const restaurant = {
                id: '',
                owner: claims.uid,
                name: utilities.trimSpaces(name),
                about: utilities.trimSpaces(about),
                rating1: 0,
                rating2: 0,
                rating3: 0,
                rating4: 0,
                rating5: 0,
                totalReviews: 0,
                totalComments: 0,
                rating: 0,
                fullRating: 0.0,
                suspended: false,
                createdOn: new Date().toString('en-US'),
                createdOnValue: new Date().getTime(),
                updatedOn: new Date().toString('en-US'),
                updatedOnValue: new Date().getTime()
            };
            return await db.runTransaction(async t => {
                const alreadyExist = db.collection(collection.restaurantCollection)
                            .where('name', '==', name);
                const alreadyExistSnapshot = await t.get(alreadyExist);
                if (!alreadyExistSnapshot.empty) {
                    errorStatus = 406;
                    return Promise.reject(new Error(`Duplicate entry: ${restaurant.name} already exists on the platform`));
                }
                var restaurantRef = db.collection(collection.restaurantCollection).doc();
                const id = restaurantRef.id;
                t.set(restaurantRef, restaurant);
                restaurant.id = id;
                res.status(200).send(restaurant);
                return Promise.resolve('Operation Successful');
            });

        } catch (error) {
            console.log('Error: ', error);
            res.status(status).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};