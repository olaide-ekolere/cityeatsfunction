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
            let id = req.body.id;
            const claims = await auth.hasAccess(db, idToken,);
            if (typeof id !== 'string' || utilities.trimSpaces(id).length < 2) {
                throw new Error('Restaurant Id is required');
            }
            if (typeof name !== 'string' || utilities.trimSpaces(name).length < 2) {
                throw new Error('Restaurant Name is must be at least 2 characters');
            }
            if (typeof about !== 'string' || utilities.trimSpaces(about).length < 2) {
                throw new Error('Restaurant About is must be at least 2 characters');
            }

            return await db.runTransaction(async t => {
                const alreadyExist = db.collection(collection.restaurantCollection)
                    .where('name', '==', name);
                const alreadyExistSnapshot = await t.get(alreadyExist);
                if (!alreadyExistSnapshot.empty) {
                    alreadyExistSnapshot.forEach((restaurantSnapshot) => {
                        if (restaurantSnapshot.id !== id) {
                            errorStatus = 406;
                            throw new Error(`Duplicate entry: ${restaurant.name} already exists on the platform`);
                        }
                    });

                }

                var restaurantRef = await db.collection(collection.restaurantCollection).doc(id);
                var restaurantSnapshot = await restaurantRef.get();
                if(!restaurantSnapshot.exists){
                    status = 403;
                    throw  new Error("Invalid Restaurant")
                }
                const restaurant = restaurantSnapshot.data();
                restaurant.name = name;
                restaurant.about = about;
                t.set(restaurantRef, restaurant);
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