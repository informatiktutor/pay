const express = require('express');
const createError = require('http-errors');
const router = express.Router();

const encoding = require('../lib/encoding');
const database = require("../lib/database");
const { loginNextUrl } = require('../lib/util');
const { form_parameters } = require('../lib/constants');
const { normalizeFormData } = require('../lib/payment');

const db = database.handle;

router.get('/', function (req, res) {
  if (!req.session.authenticated) {
    res.redirect(loginNextUrl(req.originalUrl));
    return;
  }

  res.render('new', {
    authenticated: req.session.authenticated,
    form_parameters: form_parameters
  });
});

router.post('/', async function (req, res, next) {
  if (!req.session.authenticated) {
    res.sendStatus(401);
    return;
  }

  const key = encoding.createKey();
  const entry = normalizeFormData(req.body);
  
  entry.url_key = key;
  const id = await addEntry(entry);

  res.redirect(303, '/' + encoding.encode(id, key));
});

async function addEntry(entry) {
  return new Promise(resolve => {
    db.serialize(async () => {
      await db.runAsync(`BEGIN;`);
      const { next_id } = await db.getAsync(`
        SELECT IFNULL(MAX(id) + 1, 1) as next_id
        FROM payment;
      `);
      try {
        await db.runAsync(`
          INSERT INTO payment
          (id, url_key, timestamp_created, title, description, price_cents, currency_code, reference)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
          next_id,
          entry.url_key,
          new Date().toISOString(),
          entry.title,
          entry.description,
          entry.price_cents,
          entry.currency_code,
          entry.reference
        ]);
      }
      catch (err) {
        await db.runAsync('ROLLBACK;');
        let e = new Error('failed to add the entry to the database');
        e.original_error = err;
        e.stack += '\n\n' + err.stack;
        throw e;
      }
      await db.runAsync(`COMMIT;`);
      resolve(next_id);
    });
  });
}

module.exports = router;
