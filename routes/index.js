var express = require("express");
var router = express.Router();

const encoding = require("../lib/encoding");
const { handle: db } = require("../lib/database");
const { getPayment, formattedPayment } = require("../lib/payment");
const hyphenate = require("../lib/hyphenate");
const config = require("../config");
const { form_parameters } = require("../lib/constants");
const { normalizeFormData } = require("../lib/payment");

router.put("/:id/status", async function (req, res) {
  if (!req.session.authenticated) {
    res.sendStatus(401);
    return;
  }

  let decoded;
  try {
    decoded = encoding.decode(req.params.id);
  } catch (err) {
    res.status(400).send("bad identifier encoding");
    return;
  }

  const { id, key } = decoded;
  const { paid, archived } = req.body;

  if (paid !== undefined) {
    await setBool(id, key, "paid", paid);
  }
  if (archived !== undefined) {
    await setBool(id, key, "archived", archived);
  }

  res.sendStatus(200);
});

const example = {
  key: "beispiel", // make sure this one cannot be a valid id!
  payment: formattedPayment({
    title: "Hilfe bei Deinem Aufgabenblatt",
    description:
      "Dies ist ein Beispiel für die Zahlung meiner Nachhilfe. Wähle einer der unten stehenden Zahlungsmethoden um fortzufahren!",
    price_cents: 18.0 * 100,
    currency_code: "EUR",
    reference: "INF000BSP",
    paid: 0,
  }),
  bank_details: {
    recipient: "Beispiel",
    iban: "DE01 0000 0000 0123 4567 89",
    bic: "BEISPIEL",
  },
};

router.get("/:id?", async function (req, res, next) {
  const encodedId = req.params.id;
  if (encodedId === undefined) {
    res.render("index", {
      authenticated: req.session.authenticated,
    });
    return;
  }

  let payment;
  let paypal_sdk_parameters;
  let bank_details;

  if (encodedId === example.key) {
    payment = example.payment;
    bank_details = example.bank_details;
  } else {
    let decoded;
    try {
      decoded = encoding.decode(encodedId);
    } catch (err) {
      console.log(err);
      res.redirect(307, "/");
      return;
    }

    // if (process.env.ENV === 'development') {
    //   if (!req.session.authenticated) {
    //     res.redirect(loginNextUrl(req.originalUrl));
    //   }
    // }

    const { id, key } = decoded;
    try {
      payment = await getPayment(id, key);
    } catch (err) {
      if (req.session.authenticated) {
        res.redirect(307, "/dashboard");
      } else {
        res.redirect(307, "/");
      }
      return;
    }

    bank_details = config.bank_details;
  }

  // Do not show archived payments to non-authenticated users.
  if (payment.archived && !req.session.authenticated) {
    res.redirect(307, "/");
    return;
  }

  // Manually hyphenate the description.
  // payment.description = await hyphenate(payment.description);

  paypal_sdk_parameters = Object.assign({}, config.paypal_sdk_parameters);
  paypal_sdk_parameters.currency = payment.currency_code;

  res.render("pay", {
    paypal: {
      sdk_parameters: paypal_sdk_parameters,
    },
    authenticated: req.session.authenticated,
    show_controls: req.session.authenticated,
    payment: payment,
    bank_details: bank_details,
    recipient: config.recipient,
    header: {
      center_brand_only: !req.session.authenticated,
    },
  });
});

router.post("/:id", async function (req, res, next) {
  if (!req.session.authenticated) {
    res.sendStatus(401);
    return;
  }

  let decoded;
  try {
    decoded = encoding.decode(req.params.id);
  } catch (err) {
    res.redirect(307, "/dashboard");
    return;
  }

  const data = normalizeFormData(req.body);

  await db.runAsync(
    `
    UPDATE payment
    SET title = ?, description = ?,
      price_cents = ?, currency_code = ?,
      reference = ?
    WHERE id = ?;
  `,
    [
      data.title,
      data.description,
      data.price_cents,
      data.currency_code,
      data.reference,
      decoded.id,
    ]
  );

  res.redirect(303, "/" + req.params.id);
});

router.get("/:id/edit", async function (req, res, next) {
  if (!req.session.authenticated) {
    res.sendStatus(401);
    return;
  }

  let decoded;
  try {
    decoded = encoding.decode(req.params.id);
  } catch (err) {
    res.redirect(307, "/dashboard");
    return;
  }

  const { id, key } = decoded;
  let payment = await getPayment(id, key);

  res.render("edit", {
    id: req.params.id,
    payment: payment,
    authenticated: req.session.authenticated,
    form_parameters: form_parameters,
  });
});

router.delete("/:id", async function (req, res, next) {
  let decoded;
  try {
    decoded = encoding.decode(req.params.id);
  } catch (err) {
    res.status(400).send("bad identifier encoding");
    return;
  }

  await db.runAsync(
    `
    DELETE FROM payment
    WHERE id = ?
  `,
    [decoded.id]
  );

  res.status(204).send();
});

async function setBool(id, key, column, value) {
  db.runAsync(
    `
    UPDATE payment
    SET ${column} = ?
    WHERE id = ? AND url_key = ?;
  `,
    [value ? "1" : "0", id, key]
  );
}

module.exports = router;
