const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const promiseNetwork = require('request-promise');
const collection = require('../utils/collections');
const auth = require('../utils/auth');


const db = admin.firestore();
exports.handler = async (req, res) => {
    cors(req, res, async () => {
        //check environment variable
        //fetch variables from request body
        const email = req.body.email;
        const password = req.body.password;
        const isAdmin = req.body.isAdmin === undefined ? false :req.body.isAdmin;
        var statusCode = 400;
        try {
            const apiKey = req.header('x-api-key');
            if (apiKey !== collection.apiKey) {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            if (typeof email !== 'string') {
                throw new Error('Email is required');
            }
            else {
                const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                if (!emailRegexp.test(email)) {
                    const error = 'Invalid Email supplied';
                    res.status(statusCode).send({ errorMessage: error });
                    return Promise.reject(new Error(error));
                }
            }
            if (typeof password !== 'string' || password.length < 6) {
                const error = 'Password is must be at least 6 characters';
                res.status(statusCode).send({ errorMessage: error });
                return Promise.reject(new Error(error));
            }
            if (isAdmin && !auth.isAdmin(email)) {
                const error = "You are not an admin";
                res.status(statusCode).send({ errorMessage: error });
                return Promise.reject(new Error(error));
            }
            let key = new Buffer(collection.key, 'base64').toString('ascii');
            var options = {
                method: 'POST',
                uri: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${key}`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    'email': req.body.email,
                    'password': req.body.password,
                    'returnSecureToken': true
                },
                json: true
            };
            let response = await promiseNetwork(options);

            res.status(200).send(response);
            return Promise.resolve('Sign In Done');
        } catch (error) {
            console.log(error);
            res.status(error.statusCode).send(error.error.error);
            return Promise.resolve('SIGN IN FAILED');
        }
    });
};