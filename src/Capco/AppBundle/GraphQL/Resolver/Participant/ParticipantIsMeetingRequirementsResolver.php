<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerMeetsTheRequirementResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ParticipantIsMeetingRequirementsResolver implements QueryInterface
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

    public function __invoke(Participant $participant, Argument $args, User $viewer): bool
    {
        $stepId = $args->offsetGet('stepId');

        $step = $this->getStep($stepId);

        $requirements = $this->getRequirements($step, $viewer);

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

    private function getRequirements(AbstractStep $step, User $viewer): Collection
    {
        $requirements = $step->getRequirements();

        if ($step->isUserMediator($viewer)) {
            // TODO add EMAIL to $mediatorOptionnalRequirements when 15954-parcours-participation is merged
            $mediatorOptionnalRequirements = [Requirement::PHONE, Requirement::PHONE_VERIFIED];

            return $requirements->filter(function ($requirement) use ($mediatorOptionnalRequirements) {
                return !\in_array($requirement->getType(), $mediatorOptionnalRequirements);
            });
        }

        return $requirements;
    }
}
