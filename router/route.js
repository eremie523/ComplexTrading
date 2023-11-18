const { Router } = require('express');
const router = Router();
const usersControllers = require('../controllers/appController');
const {registerMail} = require('../controllers/mailer')
const Auth = require('../middleware/auth');
const localVariables = require('../middleware/localVariables');
const coinbaseapi = require('../coinbase_pay/payment')
const adminControl = require('../controllers/adminController')

// POST Methods
router.route('/register').post(usersControllers.register);
router.route('/admin/register').post(adminControl.register);
router.route('/registerMail').post(registerMail);
router.route('/login').post(usersControllers.login);
router.route('/admin/login').post(adminControl.login);
router.route('/deposit').post(coinbaseapi.deposit)
router.route('/webhook').post(coinbaseapi.webhook)


// GET Methods
router.route('/user/:email').get(usersControllers.getUser);
router.route('/generateOTP').get( localVariables, usersControllers.generateOTP);
router.route('/verifyOTP').get(usersControllers.verifyOTP);
router.route('/createResetSession').get(usersControllers.createResetSession);

router.route('/updateuser').put(Auth, usersControllers.updateUser);
router.route('/resetPassword').put(usersControllers.resetPassword);

module.exports = router;
