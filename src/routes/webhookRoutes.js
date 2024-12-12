const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController.js');

router.post('/', webhookController.handleHubspotWebhook);

module.exports = router;
