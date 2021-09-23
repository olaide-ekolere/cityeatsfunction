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
            const id = req.body.id;
            const userId = req.body.userId;
            const suspended = req.body.suspended === undefined? false : req.body.suspended;
            if (typeof id !== 'string' || utilities.trimSpaces(id).length < 2) {
                throw new Error('Restaurant Id is required');
            }
            if (typeof userId !== 'string' || utilities.trimSpaces(userId).length < 2) {
                throw new Error('User Id is required');
            }
            if (typeof suspended !== "boolean") {
                throw new Error('Invalid suspended status');
            }
            const claims = await auth.hasAccess(db, idToken,);
            if(!auth.isAdmin(claims.email)){
                statusCode = 403;
                throw new Error('Forbidden');
            }
            
            return await db.runTransaction(async t => {
                //Load user
                const commentRef = db.collection(collection.restaurantReviewCollection)
                .doc(id).collection(collection.database).doc(userId);
                const commentSnapshot = await t.get(commentRef);
                if (!commentSnapshot.exists) {
                    status = 403;
                    throw new Error('No such comment');
                }
                const comment = commentSnapshot.data();
                comment.suspended = suspended;
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