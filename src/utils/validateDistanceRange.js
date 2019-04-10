const validateDistanceRange = (rangeToValidate, _from, _to) => {
  const from = Number(_from);
  const to = Number(_to);
  return rangeToValidate.filter(range => range[0] === from && range[1] === to).length === 1;
};

module.exports = validateDistanceRange;
