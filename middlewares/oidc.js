const passport = require('passport');
const OpenIdConnectStrategy = require('passport-openidconnect').Strategy;
const configuration = require('../configuration')

const buildStrategy = (buCode = 'group') => {
  const clients = configuration.clients;
  if (!clients[buCode]) throw new Error(`Client not found : ${buCode}`);
  return new OpenIdConnectStrategy({
    issuer: process.env.OAUTH_CLIENT_ISSUER,
    authorizationURL: `${process.env.OAUTH_CLIENT_ISSUER}/as/authorization.oauth2`,
    tokenURL: `${process.env.OAUTH_CLIENT_ISSUER}/as/token.oauth2`,
    userInfoURL: `${process.env.OAUTH_CLIENT_ISSUER}/idp/userinfo.openid`,
    clientID: clients[buCode].client_id,
    clientSecret: clients[buCode].client_secret,
    callbackURL: `http://localhost:3000/auth/callback/${buCode}`,
    scope: 'openid groups profile email advprofile',
  },
  (issuer, profile, done) => {
    done(null, profile);
  });
}
const oidcMiddleware = (request, response, next) => {
  try {
    const strategy = buildStrategy(request.params.buCode);
    passport.use('openidconnect', strategy);
    next();
  } catch (error) {
    response.status(400).send(`Unable to configure strategy for client ${buCode}`);
  }
};

module.exports = oidcMiddleware;