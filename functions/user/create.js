const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const collection = require('../utils/collections');


const db = admin.firestore();
exports.handler = async (req, res) => {
    cors(req, res, async () => {
        //check environment variable
        //fetch variables from request body
        var fullName = req.body.fullName;
        var email = req.body.email;
        var password = req.body.password;
        var statusCode = 400;
        try {
            const apiKey = req.header('x-api-key');
            if(apiKey !== collection.apiKey){
                statusCode = 403;
                throw new Error('Forbidden');
            }
            if (typeof fullName !== 'string' || fullName.length < 2) {
                throw new Error('Full Name is must be at least 2 characters');
            }
            if (typeof email !== 'string') {
                throw new Error('Email is required');
            }
            else  {
                const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                if(!emailRegexp.test(email)){
                    throw new Error('Invalid Email supplied');
                }
            }
            if (typeof password !== 'string' || password.length < 6) {
                throw new Error('Password is must be at least 6 characters');
            }
            let userRecord;
             //check if user already exists
             try {
                userRecord = await admin.auth().getUserByEmail(email);
            } catch (err) {
                userRecord = null;
            }
            if(userRecord){
                throw new Error('Email already exists');
            }
            userRecord = {
                email: email,
                password: password,
                emailVerified: false,
                displayName: fullName,
                disabled: false
            }
            userRecord = await admin.auth().createUser(userRecord);
            res.status(200).send({id: userRecord.uid});
            return Promise.resolve('Operation Successful');
        } catch (error) {
            console.log('Error: ', error);
            res.status(statusCode).send({ errorMessage: error.message });
            return Promise.reject(new Error(error));
        }
    });
};