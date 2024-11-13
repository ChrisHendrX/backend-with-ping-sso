const express = require('express');
const router = express.Router();

// Login route
router.get('/:buCode', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello ${req.user.name} ${req.user.uid}, bu : ${req.params.buCode}, email : ${req.user.email}`);
  } else {
    res.status(401).send('Unauthorized');
  }
});

module.exports = router;