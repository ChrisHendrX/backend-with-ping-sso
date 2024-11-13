const { Issuer, Strategy } = require('openid-client');
const configuration = require('../configuration');
const passport = require('passport');

const getOpenIdClient = async (buCode = 'group') => {
  const clients = configuration.clients;
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
    const client = await getOpenIdClient(request.params.buCode);
    passport.use('oidc', new Strategy({ client }, (tokenSet, user, done) => {
      return done(null, { ...tokenSet.claims(), buCode: request.params.buCode });
    }));
    next();
  } catch (error) {
    response.status(400).send(`Unable to configure strategy for client ${buCode}`);
  }
};

module.exports = oidcMiddleware;