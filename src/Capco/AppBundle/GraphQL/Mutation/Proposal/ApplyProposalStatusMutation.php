<?php

namespace Capco\AppBundle\GraphQL\Mutation\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ApplyProposalStatusMutation extends AbstractProposalStepMutation implements MutationInterface
{
    public function __invoke(Argument $args, User $user): array
    {
        try {
            $status = $this->getStatus($args->offsetGet('statusId'), $user);
            $proposals = $this->getProposals($args->offsetGet('proposalIds'), $user);
            $this->applyStatusToSeveralProposals($proposals, $status);
        } catch (UserError $userError) {
            return ['error' => $userError->getMessage()];
        }

        return [
            'proposals' => $this->getConnection($proposals, $args),
            'status' => $status,
        ];
    }

    public function isGrantedStatus(array $input, ?User $viewer, string $accessType): bool
    {
        $statusId = $input['statusId'];
        if ($statusId) {
            $status = $this->entityManager->getRepository(Status::class)->find($statusId);
            if (
                null === $status
                || !$this->authorizationChecker->isGranted(
                    $accessType,
                    $status->getStep()->getProject()
                )
            ) {
                return false;
            }
        }

        return $this->isGrantedStatusCheckProposals($input['proposalIds'], $viewer, $accessType);
    }

    private function isGrantedStatusCheckProposals(
        array $proposalsId,
        ?User $viewer,
        string $accessType
    ): bool {
        foreach ($this->getProposals($proposalsId, $viewer) as $proposal) {
            if (!$this->authorizationChecker->isGranted($accessType, $proposal)) {
                return false;
            }
        }

        return true;
    }

    private function applyStatusToSeveralProposals(array &$proposals, ?Status $status): void
    {
        $changedProposals = [];
        foreach ($proposals as $proposal) {
            if ($this->applyStatusToOneProposal($proposal, $status)) {
                $changedProposals[] = $proposal;
            }
        }
        $this->entityManager->flush();
        $this->publish($changedProposals);
    }

    private function applyStatusToOneProposal(Proposal $proposal, ?Status $status): bool
    {
        $hasChangedCollectStep = $this->applyStatusToCollectStep($proposal, $status);
        $hasChangedSelectionStep = $this->applyStatusToSelectionSteps($proposal, $status);

        return $hasChangedCollectStep || $hasChangedSelectionStep;
    }

    private function applyStatusToCollectStep(Proposal $proposal, ?Status $status): bool
    {
        if (null === $status || $status->getStep()->isCollectStep()) {
            $proposal->setStatus($status);

            return true;
        }

        return false;
    }

    private function applyStatusToSelectionSteps(Proposal $proposal, ?Status $status): bool
    {
        $hasChanged = false;
        if (null === $status || $status->getStep()->isSelectionStep()) {
            foreach ($proposal->getSelections() as $selection) {
                $hasChanged = $this->applyStatusToSelection($selection, $status);
            }
        }

        return $hasChanged;
    }

    private function applyStatusToSelection(Selection $selection, ?Status $status): bool
    {
        if (
            (null === $status || $status->getStep() === $selection->getStep())
            && $selection->getStatus() !== $status
        ) {
            $selection->setStatus($status);
            $this->entityManager->persist($selection);

            return true;
        }

        return false;
    }
}
