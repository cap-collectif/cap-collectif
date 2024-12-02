<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mediator;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Mutation\UpdateParticipantRequirementMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;

class MediatorVotesMutation
{
    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly Manager $manager, private readonly UpdateParticipantRequirementMutation $updateParticipantRequirementMutation)
    {
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

    protected function handleCheckboxes(Participant $participant, array $checkboxes)
    {
        foreach ($checkboxes as $checkbox) {
            list('requirementId' => $requirementId, 'value' => $value) = $checkbox;
            $token = $participant->getToken();
            $input = new Argument(['input' => [
                'requirementId' => $requirementId, 'value' => $value, 'participantToken' => $token,
            ]]);
            $this->updateParticipantRequirementMutation->__invoke($input);
        }
    }
}
