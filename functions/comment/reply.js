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
            const replyText = req.body.reply === undefined ? '' : utilities.trimSpaces(req.body.reply);
            const id = req.body.id;
            const userId = req.body.userId;
            if (typeof id !== 'string' || utilities.trimSpaces(id).length < 2) {
                throw new Error('Restaurant Id is required');
            }
            if (typeof replyText !== 'string' || utilities.trimSpaces(replyText).length < 2) {
                throw new Error('Reply Text is required');
            }
            if (typeof userId !== 'string' || utilities.trimSpaces(userId).length < 2) {
                throw new Error('User Id is required');
            }

            const claims = await auth.hasAccess(db, idToken,);

            const reply = {
                text: replyText,
                suspended: false,
                createdOn: new Date().toDateString(),
                createdOnValue: new Date().getTime()
            };
            return await db.runTransaction(async t => {
                //Load user
                const userRef = db.collection(collection.userCollection).doc(claims.uid);
                const userSnapshot = await t.get(userRef);
                if (userSnapshot.exists) {
                    user = userSnapshot.data();
                }
                if (user.suspended) {
                    status = 403;
                    throw new Error('Account suspended');
                }

                //Load restaurant
                const restaurantRef = db.collection(collection.restaurantCollection).doc(id);
                const restaurantSnapshot = await t.get(restaurantRef);
                if (!restaurantSnapshot.exists) {
                    status = 403;
                    throw new Error('Unknown restaurant');
                }
                const restaurant = restaurantSnapshot.data();
                if (restaurant.suspended) {
                    status = 403;
                    throw new Error('Restaurant suspended');
                }
                if (restaurant.owner !== claims.uid) {
                    status = 403;
                    throw new Error('You do not own');
                }

                //Load existing comment
                const commentRef = db.collection(collection.restaurantReviewCollection)
                    .doc(id).collection(collection.database).doc(userId);
                const commentSnapshot = await t.get(commentRef);
                if (!commentSnapshot.exists) {
                    status = 403;
                    throw new Error('User has not commented');
                }
                const comment = commentSnapshot.data();
                if(comment.reply && comment.reply.text){
                    status = 403;
                    throw new Error('You already replied');
                }
                comment.reply = reply;
                t.set(commentRef, comment);
                
                res.status(200).send(comment);
                return Promise.resolve('Operation Successful');
            });

        } catch (error) {
            console.log('Error: ', error);
            res.status(status).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};