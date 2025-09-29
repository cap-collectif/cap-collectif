<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ViewerIsMeetingRequirementsResolver implements QueryInterface
{
    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver
    ) {
    }

    public function __invoke(Argument $args, User $viewer): bool
    {
        $stepId = $args->offsetGet('stepId');

        $step = $this->getStep($stepId, $viewer);

        $requirements = $step->getRequirements();

        $hasRequirements = $requirements->count() > 0;

        if (!$hasRequirements) {
            return true;
        }

        foreach ($requirements as $requirement) {
            if (!$this->viewerMeetsTheRequirementResolver->__invoke($requirement, $viewer)) {
                return false;
            }
        }

        return true;
    }

    private function getStep(string $stepId, User $viewer): AbstractStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);

        if (!$step instanceof AbstractStep) {
            throw new \RuntimeException("AbstractStep not found for id : {$stepId}");
        }

        return $step;
    }
}
