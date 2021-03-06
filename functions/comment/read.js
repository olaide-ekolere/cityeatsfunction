const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');
const utilities = require('../utils/utilities');
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

            var pageNo = 1;
            var pageCount = 20;
            if (req.query.pageNo) {
                pageNo = parseInt(req.query.pageNo);
            }
            if (req.query.pageCount) {
                pageCount = parseInt(req.query.pageCount);
            }

            const restaurantId = req.query.restaurantId;
            if (typeof restaurantId !== 'string' || utilities.trimSpaces(restaurantId).length < 2) {
                throw new Error('Restaurant Id is required');
            }
            const r1 = req.query.r1 === undefined ? 1 : parseInt(req.query.r1);
            const r2 = req.query.r2 === undefined ? 1 : parseInt(req.query.r2);
            const r3 = req.query.r3 === undefined ? 1 : parseInt(req.query.r3);
            const r4 = req.query.r4 === undefined ? 1 : parseInt(req.query.r4);
            const r5 = req.query.r5 === undefined ? 1 : parseInt(req.query.r5);
            const all = req.query.all === undefined ? false : req.query.all;

            const ratings = [];
            if (r1 === 1) ratings.push(1);
            if (r2 === 1) ratings.push(2);
            if (r3 === 1) ratings.push(3);
            if (r4 === 1) ratings.push(4);
            if (r5 === 1) ratings.push(5);
            if (ratings.length === 0 || ratings.length === 5) {
                ratings.push(1);
                ratings.push(2);
                ratings.push(3);
                ratings.push(4);
                ratings.push(5);
            }
            const querySnapshot =
                all ? await db.collection(collection.restaurantReviewCollection)
                    .doc(restaurantId).collection(collection.database)
                    .where('rating', 'in', ratings)
                    .orderBy('updatedOnValue', 'desc')
                    .limit(pageCount).offset((pageNo - 1) * pageCount).get() :
                    await db.collection(collection.restaurantReviewCollection)
                        .doc(restaurantId).collection(collection.database)
                        .where('rating', 'in', ratings)
                        .where('suspended', '==', false)
                        .orderBy('updatedOnValue', 'desc')
                        .limit(pageCount).offset((pageNo - 1) * pageCount).get();
            const comments = [];
            if (!querySnapshot.empty) {
                querySnapshot.forEach((commentSnapshot) => {
                    var comment = commentSnapshot.data();
                    comment.id = commentSnapshot.id;
                    comments.push(comment);
                });
            }
            res.status(200).send({
                comments: comments,
                pageNo: pageNo,
                pageCount: pageCount,
            });
            return Promise.resolve('Operation Successful');
        } catch (error) {
            console.log('Error: ', error);
            res.status(statusCode).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};
