const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
//const uploadRoutes = require('./upload.route');
const providerRoutes = require('./provider.route');
//const transferRoutes = require('./transfer.route');
const planRoutes = require('./plan.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * @request method api/v1/users, auth, public, provider,
 */

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
//router.use('/public', uploadRoutes);
router.use('/provider', providerRoutes);
//router.use('/file-transfer', transferRoutes);
router.use('/plans', planRoutes);

module.exports = router;
