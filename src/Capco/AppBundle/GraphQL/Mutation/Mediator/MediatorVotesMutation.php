<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mediator;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\GraphQL\Mutation\UpdateParticipantRequirementMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;

class MediatorVotesMutation
{
    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly Manager $manager,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly UpdateParticipantRequirementMutation $updateParticipantRequirementMutation,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    /**
     * @param array<Proposal> $proposals
     */
    public function isGranted(array $proposals, string $mediatorId, ?User $viewer = null): bool
    {
        $isFeatureFlagEnabled = $this->manager->isActive('mediator');

        if (!$isFeatureFlagEnabled) {
            throw new UserError('Feature flag mediator must be enabled');
        }

        if (!$viewer) {
            return false;
        }

        if (!$viewer->isMediator()) {
            return false;
        }

        $mediator = $this->globalIdResolver->resolve($mediatorId, $viewer);
        $step = $mediator->getStep();

        foreach ($proposals as $proposalId) {
            $proposal = $this->globalIdResolver->resolve($proposalId, $viewer);
            if (!\in_array($step, $proposal->getSelectionSteps())) {
                return false;
            }
        }

        return true;
    }

    protected function canReusePhone(ProposalStepInterface $step, ContributorInterface $contributor, string $phone): void
    {
        $hasPhoneVerifiedRequirement = $step->getRequirements()->filter(fn (
            Requirement $requirement
        ) => Requirement::PHONE_VERIFIED === $requirement->getType())->count() > 0;

        if (!$hasPhoneVerifiedRequirement) {
            return;
        }

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->findExistingContributorByStepAndPhoneNumber($step, $phone, $contributor);
            if (\count($votes) > 0) {
                $contributor->setPhoneConfirmed(false);
                $this->entityManager->flush();

                throw new ContributorAlreadyUsedPhoneException();
            }
        } elseif ($step instanceof CollectStep) {
            $votes = $this->proposalCollectVoteRepository->findExistingContributorByStepAndPhoneNumber($step, $phone, $contributor);
            if (\count($votes) > 0) {
                $contributor->setPhoneConfirmed(false);
                $this->entityManager->flush();

                throw new ContributorAlreadyUsedPhoneException();
            }
        }
    }

    protected function handleCheckboxes(Participant $participant, array $checkboxes)
    {
        $token = $participant->getToken();
        $input = new Argument(['input' => [
            'values' => $checkboxes, 'participantToken' => $token,
        ]]);
        $this->updateParticipantRequirementMutation->__invoke($input);
    }
}
