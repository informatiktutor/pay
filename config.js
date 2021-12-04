/*
.env expected fields:
PAYPAL_SANDBOX_CLIENT_ID
PAYPAL_SANDBOX_CLIENT_SECRET
PAYPAL_LIVE_CLIENT_ID
PAYPAL_LIVE_CLIENT_SECRET
*/

require('dotenv').config();

const config = {};

// PayPal application client id
config.paypal_client_id = process.env.ENV == 'production'
  ? process.env.PAYPAL_LIVE_CLIENT_ID
  : process.env.PAYPAL_SANDBOX_CLIENT_ID;

// PayPal application client secret
config.paypal_client_secret = process.env.ENV == 'production'
  ? process.env.PAYPAL_LIVE_CLIENT_SECRET
  : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

// PayPal SDK script parameters
config.paypal_sdk_parameters = {
  'client-id': config.paypal_client_id,
  'components': ['buttons', 'funding-eligibility'],
  'enable-funding': ['venmo', 'sepa'],
  'disable-funding': ['giropay', 'sofort', 'card'],
  'currency': null // set by individual payment page
};

config.bank_details = {
  recipient: process.env.BANK_RECIPIENT,
  iban: process.env.BANK_IBAN,
  bic: process.env.BANK_BIC,
};

config.recipient = {
  name: process.env.RECIPIENT_NAME,
  street: process.env.RECIPIENT_STREET,
  city: process.env.RECIPIENT_CITY,
  country: process.env.RECIPIENT_COUNTRY,
};

module.exports = config;
