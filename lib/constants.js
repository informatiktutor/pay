const CENTS_FACTOR = 100;
const MIN_PRICE_CENTS = 1.00 * CENTS_FACTOR;
const MAX_PRICE_CENTS = 1000.00 * CENTS_FACTOR;
const MIN_PRICE_STEP = 0.01;
const ALLOWED_CURRENCY_CODES = ['EUR'];
const CURRENCY_CODE_SYMBOLS = {'EUR': '€'};

const form_parameters = {
  min_price_cents: MIN_PRICE_CENTS,
  max_price_cents: MAX_PRICE_CENTS,
  min_price_step: MIN_PRICE_STEP,
  currency_codes: ALLOWED_CURRENCY_CODES,
  currency_code_symbols: CURRENCY_CODE_SYMBOLS
};

module.exports = {
  CENTS_FACTOR,
  MIN_PRICE_CENTS,
  MAX_PRICE_CENTS,
  MIN_PRICE_STEP,
  ALLOWED_CURRENCY_CODES,
  CURRENCY_CODE_SYMBOLS,
  form_parameters
};
