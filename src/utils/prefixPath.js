module.exports = (prefix, path) => {
  if (path.startsWith(`/${prefix}`)) return path;
  return `/${prefix}/${path}`;
};
