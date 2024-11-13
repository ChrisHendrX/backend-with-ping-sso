const express = require('express');
const router = express.Router();
const passport = require('passport');
const oidcMiddleware = require('../middlewares/oidc');

router.get('/login/:buCode', oidcMiddleware, passport.authenticate('oidc', {
  scope: 'openid groups profile email advprofile',
}));


router.get('/callback/:buCode', (request, response, next) =>{
  passport.authenticate('oidc', {
    successRedirect: `/v1/${request.params.buCode}`,
    failureRedirect: `/login/${request.params.buCode}`,
  })(request, response, next);
});

router.get('/logout', (request, response) => {
  const endSessionUrl = `${process.env.OAUTH_CLIENT_ISSUER}/idp/startSLO.ping`;
  const postLogoutRedirectUri = 'http://localhost:3000/v1/group';
  request.session.destroy((err) => {
    if (err) return next(err);
    response.redirect(`${endSessionUrl}?TargetResource=${postLogoutRedirectUri}`);
  });
});

module.exports = router;