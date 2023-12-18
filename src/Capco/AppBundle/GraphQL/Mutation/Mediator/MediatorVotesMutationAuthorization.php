<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mediator;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;

class MediatorVotesMutationAuthorization
{
    private GlobalIdResolver $globalIdResolver;
    private Manager $manager;

    public function __construct(GlobalIdResolver $globalIdResolver, Manager $manager)
    {
        $this->globalIdResolver = $globalIdResolver;
        $this->manager = $manager;
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
}
