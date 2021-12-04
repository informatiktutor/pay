function loginNextUrl(originalUrl) {
  const path = originalUrl.replace(/^\//, '');
  return '/login?next=' + encodeURIComponent(path);
}

module.exports = {
  loginNextUrl
};
