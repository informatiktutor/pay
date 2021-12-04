var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  req.session.destroy(err => {
    if (err) {
      res.status(400).send('unable to log out');
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;
