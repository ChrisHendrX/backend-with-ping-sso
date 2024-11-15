const { Issuer } = require('openid-client');
const { clients } = require('../configuration');
const jwt = require('jsonwebtoken');

const buildOpenIdClient = async (buCode = 'group') => {
  if (!clients[buCode]) throw new Error(`Client not found : ${buCode}`);
  const issuer = await Issuer.discover(process.env.OAUTH_CLIENT_ISSUER);
  const { client_id, client_secret } = clients[buCode];
  const client = new issuer.Client({
    client_id,
    client_secret,
    redirect_uris: [`${process.env.EXPRESS_BASE_URL}/auth/callback/${buCode}`],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  });
  return client;
}

const openIdProvider = async (request, response, next) => {
  try {
    const buCode = request.params.buCode;
    const client = await buildOpenIdClient(buCode);
    request.oidcClient = client;
    next();
  } catch (error) {
    response.status(400).send(`Unable to configure strategy: ${error.message}`);
  }
}

const authenticateJWT = (request, response, next) => {
  const token = request.cookies[process.env.JWT_COOKIE_NAME];
  if (!token) return response.sendStatus(401);
  const secretKey = process.env.JWT_SECRET_KEY;
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return response.sendStatus(403);
    if (user.userInfos.buCode !== request.params.buCode) return response.sendStatus(401);
    // TODO: Check if token is still valid
    request.user = user;
    next();
  });
}

module.exports = { authenticateJWT, openIdProvider };