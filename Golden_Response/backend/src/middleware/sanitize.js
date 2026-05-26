const sanitizeInput = (req, res, next) => {
  const sanitize = (val) => {
    if (typeof val === 'string') {
      // Strip script blocks and all HTML elements to prevent XSS
      return val
        .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '')
        .replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)*\s*\/?)?>/gi, '')
        .trim();
    }
    if (val && typeof val === 'object') {
      for (const key in val) {
        val[key] = sanitize(val[key]);
      }
    }
    return val;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = { sanitizeInput };
