/**
 * Calculates the average stress level from a list of mood logs.
 * @param {Array} logs - The array of mood log objects.
 * @param {number} days - Number of recent days to consider.
 * @returns {string} The average stress level formatted to 1 decimal place.
 */
export const calculateAverageStress = (logs, days = 7) => {
  if (!logs || logs.length === 0) return '0.0';
  
  const recentLogs = logs.slice(0, days);
  const sum = recentLogs.reduce((acc, log) => acc + Number(log.stressLevel), 0);
  
  return (sum / recentLogs.length).toFixed(1);
};

/**
 * Gets the most frequent triggers from mood logs.
 * @param {Array} logs - The array of mood log objects.
 * @param {number} topN - Number of top triggers to return.
 * @returns {Array} Array of top triggers with their counts.
 */
export const getTopTriggers = (logs, topN = 3) => {
  if (!logs || logs.length === 0) return [];

  const triggerCounts = logs
    .flatMap(log => log.triggers || [])
    .reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([trigger, count]) => ({ trigger, count }));
};
