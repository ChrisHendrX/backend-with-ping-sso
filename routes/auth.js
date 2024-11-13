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

router.post('/logout', (request, response) => {
  const endSessionUrl = `${process.env.OAUTH_CLIENT_ISSUER}/idp/startSLO.ping`;
  const postLogoutRedirectUri = 'http://localhost:3000/v1/group';
  request.logout((err) => {
    if (err) return next(err);
    request.session.destroy((err) => {
      if (err) return next(err);
      response.redirect(`${endSessionUrl}?TargetResource=${postLogoutRedirectUri}`);
    });
  });
});

module.exports = router;