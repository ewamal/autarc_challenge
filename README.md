# Autarc Backend Challenge

This repository contains an Express.js-based backend API that integrates with HubSpot CRM and a local Postgres database.
Changes made locally are reflected in HubSpot and vice versa through HubSpot webhooks.

API Endpoints:

/api/customers: Manage customers (create, read, update, delete).

/api/webhooks: Handle HubSpot webhook events.

## Getting started


### Prerequisites
Node.js
npm
Docker
HubSpot Developer Account
ngrok 

### Environment Variables
Create a .env file from .env.template

### Setup

```python
docker-compose up -d
```
Install dependencies
```python
npm install
```

Expose Webhook Endpoint
```python
ngrok http 3000
```

### Setup
```python
npm start
```

### Testing
```
npm test
```

### Webhook Configuration
In order to run the webhook, a private app has to be created in the HubSpot Developer account and public URL provided (ngrok). 

Configuration:
Configure Webhooks to subscribe to contact creation, deletion and property change events.

Testing Webhooks:
Trigger events in HubSpot to verify that they are received and handled by the backend.
