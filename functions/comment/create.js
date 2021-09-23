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
            const rating = req.body.rating;
            const commentText = req.body.comment === undefined ? '' : utilities.trimSpaces(req.body.comment);
            const id = req.body.id;
            const visitDate = req.body.visitDate;
            const claims = await auth.hasAccess(db, idToken,);
            if (typeof id !== 'string' || utilities.trimSpaces(id).length < 2) {
                throw new Error('Restaurant Id is required');
            }
            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                throw new Error(`Invalid rating: ${rating}`);
            }
            if (typeof visitDate !== 'string' || utilities.trimSpaces(visitDate).length !== 10) {
                throw new Error('Vist Date must be yyyy-mm-dd');
            }

            const comment = {
                owner: claims.uid,
                comment: commentText,
                rating: rating,
                reply: {},
                visitDate: new Date(visitDate).toDateString(),
                suspended: false,
                createdOn: new Date().toString('en-US'),
                createdOnValue: new Date().getTime(),
                updatedOn: new Date().toString('en-US'),
                updatedOnValue: new Date().getTime()
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
                comment.name = user.displayName;

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
                if (restaurant.owner === claims.uid) {
                    status = 403;
                    throw new Error('You cannot comment on own');
                }

                //Load existing comment
                const commentRef = db.collection(collection.restaurantReviewCollection)
                    .doc(id).collection(collection.database).doc(claims.uid);
                const commentSnapshot = await t.get(commentRef);
                if (commentSnapshot.exists) {
                    status = 403;
                    throw new Error('You already commented');
                }

                //Load dashboard
                const dashboardRef = db.collection(collection.settings)
                    .doc(collection.dashboard);
                const dashboardSnapshot = await t.get(dashboardRef);
                const dashboard = dashboardSnapshot.data();

                //update dashboard
                dashboard.reviews += 1;
                if (commentText) {
                    dashboard.comments += 1;
                }
                //update restaurant
                restaurant.totalReviews += 1;
                if (commentText) {
                    restaurant.totalComments += 1;
                }

                if (rating === 1) {
                    restaurant.rating1 += 1;
                }
                else if (rating === 2) {
                    restaurant.rating2 += 1;
                }
                else if (rating === 3) {
                    restaurant.rating3 += 1;
                }
                else if (rating === 4) {
                    restaurant.rating4 += 1;
                }
                else {
                    restaurant.rating5 += 1;
                }

                const totalScore = (restaurant.rating5 * 5) + (restaurant.rating4 * 4) +
                    (restaurant.rating3 * 3) + (restaurant.rating2 * 2) + restaurant.rating1;
                const totalUsers = restaurant.rating5 + restaurant.rating4 + restaurant.rating3 +
                    restaurant.rating2 + restaurant.rating1;
                const average = totalScore / totalUsers;

                restaurant.fullRating = average.toFixed(4); 
                restaurant.rating = Math.floor(average);

                //save all
                t.set(dashboardRef, dashboard);
                t.set(commentRef, comment);
                t.set(restaurantRef, restaurant);
                
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