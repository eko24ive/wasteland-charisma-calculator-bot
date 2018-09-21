require('dotenv').config({ path: '../../.env' });

const validateForwardDate = (date) => {
  if (date < 1537304400 && process.env.ENV === 'PRDUCTION') {
    return false;
  }

  return true;
};

module.exports = validateForwardDate;
