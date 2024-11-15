const jwt = require('jsonwebtoken');

const rolePrefix = Object.freeze({
  bmfr: 'FR-BM',
  bmit: 'IT-BM',
  bmpl: 'PL-BM',
  bmes: 'ES-BM',
  lmfr: 'FR-LM',
  lmes: 'ES-LM',
  lmit: 'IT-SIB',
  lmpl: 'PL-LM',
  lmpt: 'PT-LM',
  lmro: 'RO-LM',
  lmsa: 'ZA-LM',
  lmua: 'UA-LM',
  ompt: 'PT-OM',
  bcit: 'IT-BC',
  wdfr: 'FR-WE',
  zdfr: 'FR-OC',
  group: 'GO-LM',
});
const createUserToken = (user, access_token, buCode) => {
  const secretKey = process.env.JWT_SECRET_KEY;
  const { uid, given_name: firstName, family_name: lastName, email, memberof, privbusinesscategorycode: managementEntityId, employeeType } = user;

  const credentials = { ping: { access_token } };
  const name = `${firstName} ${lastName}`;
  const { roles, groups } = memberof.reduce((acc, role) => {
    const roleMatch = role.match(/cn=(?<role>[^,]*)/);
    if (!roleMatch) return acc;
    if (role.includes('ou=applicationRole')) {
      const prefix = rolePrefix[buCode];
      if (!prefix) return acc;
      if (roleMatch.groups.role.startsWith(prefix)) acc.roles.push(roleMatch.groups.role);
    }
    if (role.includes('ou=mailgroup')) acc.groups.push(roleMatch.groups.role);
    return acc;
  }, { roles: [], groups: [] });
  const userInfos = { uid, firstName, lastName, name, email, managementEntityId, employeeType, roles, groups, buCode };
  const payload = { credentials, userInfos, iss: 'IKY Backend', sub: uid, aud: 'IKY' };
  const token = jwt.sign(payload, secretKey, { expiresIn: '30s' });
  return token;
}

module.exports = { createUserToken };