const bcrypt = require("bcrypt");
var express = require('express');
var router = express.Router();

const { handle: db } = require("../lib/database");

router.get('/', function (req, res) {
  if (req.session.authenticated) {
    res.redirect('/');
    return;
  }
  res.render('login', defaultOptions());
});

router.post('/', async function (req, res) {
  const password = req.body.password;
  if (!password) {
    res.render('login', defaultOptionsWith({
      incorrect_password: true
    }));
    return;
  }

  const row = await db.getAsync(`SELECT password_hash FROM admin;`);
  if (!row) {
    res.render('login', defaultOptionsWith({
      no_password_configured: true
    }));
    return;
  }

  const isCorrect = await bcrypt.compare(password, row.password_hash);
  if (!isCorrect) {
    res.render('login', defaultOptionsWith({
      incorrect_password: true
    }));
    return;
  }

  req.session.authenticated = true;
  req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7 * 26; // 6 months

  let target = 'dashboard';
  if (req.body.next) {
    target = req.body.next;
  }
  res.redirect('/' + target);
});

function defaultOptionsWith(object) {
  const default_ = {
    header: {
      center_brand_only: true
    }
  };
  return Object.assign(default_, object);
}

function defaultOptions() {
  return defaultOptionsWith({});
}

module.exports = router;
