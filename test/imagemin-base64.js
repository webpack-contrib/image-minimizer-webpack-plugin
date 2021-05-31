module.exports = () => (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    return Promise.reject(new TypeError("Expected a buffer"));
  }

  return Promise.resolve(Buffer.from(buffer.toString("base64")));
};
