// @flow
export const getSpentPercentage = (budget: ?number, creditsSpent: ?number): number => {
  if (!budget || !creditsSpent) return 0;
  const percentage = creditsSpent > 0 && budget > 0 ? (creditsSpent / budget) * 100 : 0;
  return Math.round(percentage * 100) / 100;
};

export default getSpentPercentage;
