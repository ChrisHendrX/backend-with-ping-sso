const express = require('express');
const router = express.Router();
const passport = require('passport');
const { oidcMiddleware } = require('../middlewares/auth');
const { cookieOptions } = require('../configuration');

router.get('/login/:buCode', oidcMiddleware, passport.authenticate('oidc', { scope: 'openid groups profile email advprofile' }));


router.get('/callback/:buCode', (request, response, next) => {
  const failureRedirect = `/auth/login/${request.params.buCode}`;
  passport.authenticate('oidc', { failureRedirect })(request, response, next);
}, (request, response) => {
  const redirectUrl = `${process.env.FRONT_END_BASE_URL}/${request.params.buCode}`;
  response.redirect(redirectUrl);
});

router.get('/status/:buCode', oidcMiddleware, (request, response) => {
  if (request.isAuthenticated()) return response.json(request.user);
  return response.status(401).send('Unauthorized');
});

router.post('/logout', (request, response) => {
  const url = new URL('idp/startSLO.ping', process.env.OAUTH_CLIENT_ISSUER);
  response.clearCookie(process.env.JWT_COOKIE_NAME, cookieOptions);
  url.searchParams.append('TargetResource', process.env.FRONT_END_BASE_URL);
  request.session.destroy((err) => {
    if (err) return next(err);
    return response.json({ redirectUrl: url.href });
  });
});

module.exports = router;