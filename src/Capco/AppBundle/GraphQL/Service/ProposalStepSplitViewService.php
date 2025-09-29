<?php

namespace Capco\AppBundle\GraphQL\Service;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\VoteType;
use Doctrine\ORM\EntityManagerInterface;

class ProposalStepSplitViewService
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {
    }

    /**
     * @param CollectStep|SelectionStep                                     $step
     * @param array<string, null|array<string, null|int|string>|int|string> $data
     */
    public function proposalStepSplitViewWasDisabled(AbstractStep $step, array $data): bool
    {
        $shouldDisableProposalStepSplitView = $this->shouldDisableProposalStepSplitView($step, $data);

        $proposalStepSplitViewWasDisabled = $step->getProject()->getIsProposalStepSplitViewEnabled() && $shouldDisableProposalStepSplitView;

        if ($proposalStepSplitViewWasDisabled) {
            $step->getProject()->setIsProposalStepSplitViewEnabled(false);
            $this->em->flush();
        }

        return $proposalStepSplitViewWasDisabled;
    }

    /**
     * @param array<string, null|array<string, null|int|string>|int|string> $data
     */
    public function shouldDisableProposalStepSplitView(AbstractStep $step, array $data): bool
    {
        if (!$step instanceof CollectStep && !$step instanceof SelectionStep) {
            return false;
        }

        if (!\array_key_exists('voteType', $data)
            || !\array_key_exists('voteThreshold', $data)) {
            return false;
        }

        return
            VoteType::BUDGET === $data['voteType']
            || (
                null !== $data['voteThreshold']
                && ($data['voteThreshold'] > 0)
            )
        ;
    }
}
