// @flow
export const getSpentPercentage = (budget: number, creditsSpent: number) => {
  const percentage = creditsSpent > 0 && budget > 0 ? (creditsSpent / budget) * 100 : 0;
  return Math.round(percentage * 100) / 100;
};

export default getSpentPercentage;
