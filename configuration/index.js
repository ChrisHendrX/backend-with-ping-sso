module.exports = {
  clients: {
    bmfr: {
      client_id: process.env.OAUTH_BMFR_CLIENT_ID,
      client_secret: process.env.OAUTH_BMFR_CLIENT_SECRET,
    },
    wdfr: {
      client_id: process.env.OAUTH_WDFR_CLIENT_ID,
      client_secret: process.env.OAUTH_WDFR_CLIENT_SECRET,
    },
    group: {
      client_id: process.env.OAUTH_GROUP_CLIENT_ID,
      client_secret: process.env.OAUTH_GROUP_CLIENT_SECRET
    }
  }
};