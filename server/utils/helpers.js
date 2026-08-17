// Format mongoose document for API response
const formatResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

// Calculate percentage
const calcPercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get date range for queries
const getDateRange = (period) => {
  const now = new Date();
  switch (period) {
    case 'today':
      return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
    case 'week':
      return { start: new Date(now.getTime() - 7 * 86400000), end: new Date() };
    case 'month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date() };
    default:
      return { start: new Date(0), end: new Date() };
  }
};

// Slugify text
const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

module.exports = { formatResponse, calcPercentage, getDateRange, slugify };
