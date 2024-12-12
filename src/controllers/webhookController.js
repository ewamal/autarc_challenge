const Customer = require('../models/Customer');

class WebhookController {
  /**
   * Handle HubSpot Webhook Events.
   */
  async handleHubspotWebhook(req, res, next) {
    try {
      console.log('Incoming webhook payload:', JSON.stringify(req.body, null, 2));

      const events = req.body;

      if (!Array.isArray(events)) {
        console.error('Webhook payload is not an array');
        return res.status(400).send('Invalid webhook payload');
      }

      for (const event of events) {
        const { subscriptionType, objectId, propertyName, propertyValue } = event;

        if (!subscriptionType || !objectId) {
          console.error('Missing required fields in webhook event:', event);
          continue;
        }

        const hubspotId = String(objectId);

        switch (subscriptionType) {
          case 'contact.creation':
            console.log(`Handling contact creation event for HubSpot ID: ${hubspotId}`);
            break;

          case 'contact.deletion':
            console.log(`Handling contact deletion event for HubSpot ID: ${hubspotId}`);
            await Customer.destroy({ where: { hubspotId } });
            break;

          case 'contact.propertyChange':
            console.log(`Handling contact property change event for HubSpot ID: ${hubspotId}`);
            const customer = await Customer.findOne({ where: { hubspotId } });
            if (customer) {
              const updates = {};
              if (propertyName === 'email') updates.email = propertyValue;
              if (propertyName === 'firstname' || propertyName === 'lastname') {
                const nameParts = customer.name.split(' ');
                if (propertyName === 'firstname') nameParts[0] = propertyValue;
                if (propertyName === 'lastname') nameParts[1] = propertyValue;
                updates.name = nameParts.join(' ');
              }
              if (propertyName === 'phone') updates.phone = propertyValue;
              await customer.update(updates);
            }
            break;

          default:
            console.warn('Unhandled subscription type:', subscriptionType);
        }
      }

      res.status(200).send('Webhook events processed');
    } catch (error) {
      console.error('Error handling HubSpot webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new WebhookController();
