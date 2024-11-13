const logRefererMiddleware = (req, res, next) => {
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  console.log('Request made from:', referer || origin || 'Unknown');
  next();
};

module.exports = logRefererMiddleware;