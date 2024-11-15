const express = require('express');
const { logRefererMiddleware } = require('../middlewares/test');
const { authenticateJWT } = require('../middlewares/auth');
const router = express.Router();

router.get('/:buCode', authenticateJWT, (request, response) => {
  return response.json(request.user)
});

module.exports = router;