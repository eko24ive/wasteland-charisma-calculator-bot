/* eslint-disable */

const tinyHash = (string) => {
  let hash = 0;

  if (string.length === 0) {
    return hash;
  }

  for (let i = 0; i < string.length; i ++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash; // Convert to 32bit integer
  }

  return Math.abs(Number(hash));
};

module.exports = tinyHash;
