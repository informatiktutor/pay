const express = require('express');
const router = express.Router();

const { loginNextUrl } = require('../lib/util');
const { getAllPayments } = require('../lib/payment');

router.get('/', async function (req, res) {
  if (!req.session.authenticated) {
    res.redirect(loginNextUrl(req.originalUrl));
    return;
  }

  const payments = await getAllPayments();

  // const payments = await db.allAsync(`
  //   SELECT id, url_key, date_created, title, description,
  //     price_cents, currency_code, reference, paid, archived
  //   FROM payment;
  // `);

  // for (let i = 0; i < payments.length; i++) {
  //   const payment = payments[i];
  //   payment.paid = payment.paid === 1;
  //   payment.archived = payment.archived === 1;
  //   payment.identifier = encoding.encode(payment.id, payment.url_key);
  //   delete payment.id;
  //   delete payment.url_key;
  //   payment.price = (payment.price_cents / 100).toFixed(2);
  //   delete payment.price_cents;
  // }

  res.render('dashboard', {
    is_dashboard: true,
    authenticated: req.session.authenticated,
    payments: payments
  });
});

module.exports = router;
