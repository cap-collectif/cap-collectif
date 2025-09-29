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
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

class ParticipantIsMeetingRequirementsResolver implements QueryInterface
{
    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Participant $participant, Argument $args, ?User $viewer = null): bool
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
                $this->logger->log(LogLevel::INFO, "Requirement {$requirement->getType()} not met");

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

    private function getRequirements(AbstractStep $step, ?User $viewer = null): Collection
    {
        $requirements = $step->getRequirements();

        if (!$viewer) {
            return $requirements;
        }

        if ($step->isUserMediator($viewer)) {
            $mediatorOptionnalRequirements = [Requirement::PHONE, Requirement::PHONE_VERIFIED, Requirement::EMAIL_VERIFIED];

            return $requirements->filter(fn ($requirement) => !\in_array($requirement->getType(), $mediatorOptionnalRequirements));
        }

        return $requirements;
    }
}
