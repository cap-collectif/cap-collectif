<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalArchiveLimitDateResolver;

/**
 * Tells whether a proposal still accepts votes in a step, regardless of the step dates.
 *
 * A proposal stops accepting votes once it is archived, or once its archiving
 * deadline has passed in a step configured with automatic archiving. The second
 * case covers proposals that reached the vote threshold: they are never archived
 * by the cron, but their vote period is over all the same.
 */
class ProposalVotePeriodChecker
{
    public function __construct(
        private readonly ProposalArchiveLimitDateResolver $proposalArchiveLimitDateResolver
    ) {}

    public function isVotePeriodOver(Proposal $proposal, CollectStep|SelectionStep $step, ?\DateTimeInterface $now = null): bool
    {
        if ($proposal->isArchived()) {
            return true;
        }

        if ($step->getProposalArchivedTime() <= 0) {
            return false;
        }

        $limitDate = $this->proposalArchiveLimitDateResolver->__invoke($proposal);

        return null !== $limitDate && $limitDate < ($now ?? new \DateTime());
    }
}
