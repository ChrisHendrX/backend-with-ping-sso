const { Issuer, Strategy } = require('openid-client');
const configuration = require('../configuration');
const passport = require('passport');

const buildOpenIdClient = async (buCode = 'group') => {
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
  client.authorizationUrl({ scope: 'openid groups profile email advprofile' });
  return client;
}
const oidcMiddleware = async (request, response, next) => {
  try {
    const client = await buildOpenIdClient(request.params.buCode);
    request.oidcClient = client;
    passport.use('oidc', new Strategy({ client }, async (tokenSet, userinfo, done) => {
      // const userinfo = await client.userinfo(tokenSet.access_token);
      const user = {
        idToken: tokenSet.id_token,
        accessToken: tokenSet.access_token,
        profile: {...tokenSet.claims(), ...userinfo},
        buCode: request.params.buCode
      };
      return done(null, user);
    }));
    next();
  } catch (error) {
    response.status(400).send(`Unable to configure strategy: ${error.message}`);
  }
};

module.exports = { oidcMiddleware };