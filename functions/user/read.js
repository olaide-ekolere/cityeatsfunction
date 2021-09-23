const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');
const db = admin.firestore();
const auth = require('../utils/auth');

exports.handler = async (req, res) => {
    cors(req, res, async () => {
        //check environment variable
        //fetch variables from request body
        const idToken = req.header('FIREBASE_AUTH_TOKEN');
        var statusCode = 400;
        try {
            const apiKey = req.header('x-api-key');
            if (apiKey !== collection.apiKey) {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            if (idToken === undefined) {
                statusCode = 403;
                throw new Error('Unauthorized Access');
            }
            const claims = await auth.hasAccess(db, idToken,);
            if(!auth.isAdmin(claims.email)){
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
            const querySnapshot = await db.collection(collection.userCollection)
                    .orderBy('displayName', 'asc')
                    .limit(pageCount).offset((pageNo - 1) * pageCount).get();
            const users = [];
            if (!querySnapshot.empty) {
                querySnapshot.forEach((userSnapshot) => {
                    var user = userSnapshot.data();
                    user.id = userSnapshot.id;
                    users.push(user);
                });
            }
            res.status(200).send({
                users: users,
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
