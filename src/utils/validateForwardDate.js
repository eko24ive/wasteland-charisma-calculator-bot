require('dotenv').config({ path: '../../.env' });

const validateForwardDate = (date) => {
  if (date < 1575327664 && process.env.SKIP_DATE_VALIDATION !== false) {
    return false;
  }

  return true;
};

module.exports = validateForwardDate;
