class ProposalVoteHelper {

  getSpentPercentage(budget, creditsSpent) {
    const percentage = creditsSpent > 0 && budget > 0
      ? creditsSpent / budget * 100
      : 0;
    return Math.round(percentage * 100) / 100;
  }

  getVotesDelta(userHasVoteInitially, userHasVote) {
    if (userHasVote && !userHasVoteInitially) {
      return 1;
    }
    if (!userHasVote && userHasVoteInitially) {
      return -1;
    }
    return 0;
  }

}

export default new ProposalVoteHelper();
