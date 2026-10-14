<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * The collect step that receives the vocal contributions submitted from the homepage.
 */
class QueryVocalContributionStepResolver implements QueryInterface
{
    public function __construct(
        private readonly CollectStepRepository $repository,
        private readonly Manager $manager
    ) {
    }

    public function __invoke(mixed $viewer = null): ?CollectStep
    {
        if (!$this->manager->isActive(Manager::vocal_contribution)) {
            return null;
        }

        $step = $this->repository->findVocalContributionStep();

        return $step?->canDisplay($viewer instanceof User ? $viewer : null) ? $step : null;
    }
}
