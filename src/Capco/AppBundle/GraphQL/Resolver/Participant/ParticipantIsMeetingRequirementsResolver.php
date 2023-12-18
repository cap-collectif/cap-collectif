<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerMeetsTheRequirementResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ParticipantIsMeetingRequirementsResolver implements ResolverInterface
{
    private GlobalIdResolver $globalIdResolver;
    private ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->viewerMeetsTheRequirementResolver = $viewerMeetsTheRequirementResolver;
    }

    public function __invoke(Participant $participant, Argument $args): bool
    {
        $stepId = $args->offsetGet('stepId');

        $step = $this->getStep($stepId);

        $requirements = $step->getRequirements();
        $hasRequirements = $requirements->count() > 0;

        if (!$hasRequirements) {
            return true;
        }

        foreach ($requirements as $requirement) {
            if (!$this->viewerMeetsTheRequirementResolver->__invoke($requirement, $participant)) {
                return false;
            }
        }

        return true;
    }

    private function getStep(string $stepId): AbstractStep
    {
        $step = $this->globalIdResolver->resolve($stepId);

        if (!$step instanceof AbstractStep) {
            throw new \RuntimeException("AbstractStep not found for id : {$stepId}");
        }

        return $step;
    }
}
