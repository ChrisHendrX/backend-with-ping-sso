const express = require('express');
const router = express.Router();
const passport = require('passport');
const oidcMiddleware = require('../middlewares/oidc');

router.get('/login/:buCode', oidcMiddleware, passport.authenticate('openidconnect'));

router.get('/callback/:buCode', (request, response, next) => {
  const { buCode } = request.params;
  passport.authenticate('openidconnect', {
    successRedirect: `/v1/${buCode}`,
    failureRedirect: `/login/${buCode}`
  })(request, response, next);
});

module.exports = router;