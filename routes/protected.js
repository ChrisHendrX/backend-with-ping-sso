const express = require('express');
const { logRefererMiddleware } = require('../middlewares/test');
const { oidcMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.get('/:buCode', logRefererMiddleware, oidcMiddleware, (request, response) => {
  if (request.isAuthenticated()) {
    response.json(request.user)
  } else {
    response.status(401).send('Unauthorized');
  }
});

module.exports = router;