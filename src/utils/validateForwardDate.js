require('dotenv').config({ path: '../../.env' });

const validateForwardDate = (date) => {
  if (date < 1537304400 && process.env.SKIP_DATE_VALIDATION !== false) {
    return false;
  }

  return true;
};

module.exports = validateForwardDate;
