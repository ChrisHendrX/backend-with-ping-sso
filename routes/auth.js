const express = require('express');
const router = express.Router();
const { openIdProvider, authenticateJWT } = require('../middlewares/auth');
const { cookieOptions, maxAge } = require('../configuration');
const { createUserToken } = require('../utils/token');

router.get('/login/:buCode', openIdProvider, (request, response, next) => {
  const client = request.oidcClient;
  const authorizationUrl = client.authorizationUrl({
    scope: 'openid profile email advprofile groups offline_access',
  });
  response.redirect(authorizationUrl);
});


router.get('/callback/:buCode', openIdProvider, async (request, response, next) => {
  try {
    const buCode = request.params.buCode;
    const client = request.oidcClient;
    const params = client.callbackParams(request);
    const tokenSet = await client.callback(`${process.env.EXPRESS_BASE_URL}/auth/callback/${buCode}`, params);
    const userinfo = await client.userinfo(tokenSet.access_token)
    const token = createUserToken(userinfo, tokenSet.access_token, buCode);
    const redirectUrl = `${process.env.FRONT_END_BASE_URL}/${request.params.buCode}`;
    response.cookie(process.env.JWT_COOKIE_NAME, token, { ...cookieOptions, maxAge });
    response.redirect(redirectUrl);
  } catch (err) {
    console.error('Erreur lors de l’authentification:', err);
    response.status(500).send('Erreur d’authentification');
  }
});

router.post('/logout', (request, response) => {
  const url = new URL('idp/startSLO.ping', process.env.OAUTH_CLIENT_ISSUER);
  response.clearCookie(process.env.JWT_COOKIE_NAME, cookieOptions);
  url.searchParams.append('TargetResource', process.env.FRONT_END_BASE_URL);
  return response.json({ redirectUrl: url.href });
});

router.get('/status/:buCode', authenticateJWT, (request, response) => {
  return response.json(request.user.userInfos);
});

router.get('/ping/:buCode', authenticateJWT, (request, response) => {
  return response.json(request.user.credentials.ping.access_token);
});

module.exports = router;