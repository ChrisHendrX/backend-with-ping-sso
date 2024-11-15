const { Issuer, Strategy } = require('openid-client');
const { clients, cookieOptions, maxAge } = require('../configuration');
const passport = require('passport');
const { createUserToken } = require('../utils/token');

const buildOpenIdClient = async (buCode = 'group') => {
  if (!clients[buCode]) throw new Error(`Client not found : ${buCode}`);
  const issuer = await Issuer.discover(process.env.OAUTH_CLIENT_ISSUER);
  const { client_id, client_secret } = clients[buCode];
  const client = new issuer.Client({
    client_id,
    client_secret,
    redirect_uris: [`http://localhost:3000/auth/callback/${buCode}`],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  });
  return client;
}
const oidcMiddleware = async (request, response, next) => {
  try {
    const buCode = request.params.buCode;
    const client = await buildOpenIdClient(buCode);
    request.oidcClient = client;
    passport.use('oidc', new Strategy({ client }, async (tokenSet, userinfo, done) => {
      const token = createUserToken(userinfo, tokenSet.access_token, buCode);
      // response.cookie(process.env.JWT_COOKIE_NAME, token, { ...cookieOptions, maxAge });
      const user = {
        idToken: tokenSet.id_token,
        accessToken: tokenSet.access_token,
        profile: { ...tokenSet.claims(), ...userinfo },
        buCode,
      };
      return done(null, user);
    }));
    next();
  } catch (error) {
    response.status(400).send(`Unable to configure strategy: ${error.message}`);
  }
};

const authenticateJWT = (req, res, next) => {
  const token = req.cookies[proccess.env.JWT_COOKIE_NAME];
  if (!token) return res.sendStatus(401);

  const secretKey = process.env.JWT_SECRET_KEY;
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Token invalide
    req.user = user; // Ajoute l'utilisateur au `req` pour un accès ultérieur
    next();
  });
}

module.exports = { oidcMiddleware, authenticateJWT };