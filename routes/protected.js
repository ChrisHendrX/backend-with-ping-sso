const express = require('express');
const router = express.Router();

// Login route
router.get('/:buCode', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello ${req.user.displayName} ${req.user.id}, bu : ${req.params.buCode}`);
  } else {
    res.status(401).send('Unauthorized');
  }
});

module.exports = router;