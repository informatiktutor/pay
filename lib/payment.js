const encoding = require('../lib/encoding');
const { handle: db } = require('./database');
const { 
  CENTS_FACTOR,
  MIN_PRICE_CENTS,
  MAX_PRICE_CENTS,
  ALLOWED_CURRENCY_CODES,
  CURRENCY_CODE_SYMBOLS
} = require('../lib/constants');

const PAYMENT_COLUMNS = `
  id, url_key, timestamp_created, title, description,
  price_cents, currency_code, reference, paid, archived
`;

async function getPayment(id, key) {
  const payment = await db.getAsync(`
    SELECT ${PAYMENT_COLUMNS}
    FROM payment
    WHERE id = ? AND url_key = ?;
  `, [id, key]);
  if (payment === undefined) {
    throw Error('payment not found');
  }
  formatPayment(payment);
  return payment;
}

async function getAllPayments() {
  const payments = await db.allAsync(`
    SELECT ${PAYMENT_COLUMNS}
    FROM payment;
  `);
  if (payments === undefined) {
    throw Error('no payments found');
  }
  for (let i = 0; i < payments.length; i++) {
    formatPayment(payments[i]);
  }
  return payments;
}

function formatPayment(payment) {
  payment.date_created = new Date(payment.timestamp_created);
  delete payment.timestamp_created;
  payment.paid = payment.paid === 1;
  payment.archived = payment.archived === 1;
  payment.identifier = encoding.encode(payment.id, payment.url_key);
  delete payment.id;
  delete payment.url_key;
  payment.price_value = payment.price_cents / 100;
  payment.price = payment.price_value.toFixed(2);
  payment.price_local = payment.price.replace(/\./g, ',');
  delete payment.price_cents;
  payment.currency_symbol = CURRENCY_CODE_SYMBOLS[payment.currency_code];
}

function validateText(text, textName='text') {
  if (text.length === 0) {
    throw new Error('the ' + textName + ' cannot be empty');
  }
}

function normalizeText(text) {
  // TODO Replace all "du", "dir", "deine", etc. with "Du", "Dir", ...
  return String(text).trim();
}

function formatPriceCents(priceCents) {
  return Math.floor(priceCents / CENTS_FACTOR).toFixed(2);
}

function parsePrice(price) {
  price = price.trim().replace(',', '.');
  const value = parseFloat(price);
  if (Number.isNaN(value)) {
    throw new Error('the price must be a valid number');
  }
  const cents = value * CENTS_FACTOR;
  if (cents !== Math.floor(cents)) {
    const decimalPlaces = Math.floor(Math.log10(CENTS_FACTOR));
    throw new Error('there may not be more than '
      + decimalPlaces + ' decimal places')
  }
  if (cents < MIN_PRICE_CENTS) {
    throw new Error('the price must be at least '
      + formatPriceCents(MIN_PRICE_CENTS));
  }
  if (cents > MAX_PRICE_CENTS) {
    throw new Error('the price must be no larger than '
      + formatPriceCents(MAX_PRICE_CENTS));
  }
  return cents;
}

function normalizeCurrencyCode(currencyCode) {
  return String(currencyCode).trim().toUpperCase();
}

function validateCurrencyCode(currencyCode) {
  if (!ALLOWED_CURRENCY_CODES.includes(currencyCode)) {
    throw new Error('the specified currency is not allowed')
  }
}

function normalizeFormData(raw) {
  validateText(raw.title, 'title');
  validateText(raw.description, 'description');
  validateText(raw.reference, 'reference');

  const currencyCode = normalizeCurrencyCode(raw.currency_code);
  validateCurrencyCode(currencyCode);

  return {
    title: normalizeText(raw.title),
    description: normalizeText(raw.description),
    price_cents: parsePrice(raw.price),
    currency_code: currencyCode,
    reference: raw.reference
  };
}

module.exports = {
  getPayment,
  getAllPayments,
  normalizeFormData
};
