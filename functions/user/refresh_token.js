const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const promiseNetwork = require('request-promise');
const collection = require('../utils/collections');


const db = admin.firestore();
exports.handler = async (req, res) => {
    cors(req, res, async () => {
        //check environment variable
        //fetch variables from request body
        var refreshToken = req.body.refreshToken;
        var statusCode = 400;
        try {
            const apiKey = req.header('x-api-key');
            if (apiKey !== collection.apiKey) {
                statusCode = 403;
                throw new Error('Forbidden');
            }
            let key = new Buffer(collection.key, 'base64').toString('ascii');
            let response = await promiseNetwork.post(
                {
                 url: `https://securetoken.googleapis.com/v1/token?key=${key}`,
                 form: {
                     'grant_type': 'refresh_token',
                     'refresh_token': refreshToken,
                 }
                });
            response = JSON.parse(response);
            res.status(200).send(
                {
                localId : response.user_id,
                idToken : response.access_token,
                refreshToken: response.refresh_token,
                expiresIn : response.expires_in
            });
            return Promise.resolve('Refresh Done Done');
        } catch (error) {
            console.log('Error: ', error);
            res.status(status).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};