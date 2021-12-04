function isMobile() {
  const r = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return r.test(navigator.userAgent);
};
