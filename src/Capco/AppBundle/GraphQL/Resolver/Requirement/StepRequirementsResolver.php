<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class StepRequirementsResolver implements QueryInterface
{
    public function __construct(private readonly RequirementRepository $repository, private readonly ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver, private readonly ConnectionBuilderInterface $builder)
    {
    }

    public function __invoke(
        AbstractStep $step,
        Argument $args,
        ?User $user = null
    ): ConnectionInterface {
        $requirements = $this->repository->getByStep($step);

        $connection = $this->builder->connectionFromArray($requirements, $args);
        $connection->setTotalCount(\count($requirements));

        if (
            $step instanceof QuestionnaireStep
            || $step instanceof SelectionStep
            || $step instanceof CollectStep
            || $step instanceof ConsultationStep
        ) {
            $connection->{'reason'} = $step->getRequirementsReason();
        }
        $connection->{'viewerMeetsTheRequirements'} = false;

        if ($user instanceof User) {
            $connection->{'viewerMeetsTheRequirements'} = $this->viewerMeetsTheRequirementsResolver(
                $user,
                $step
            );
        }

        return $connection;
    }

    public function viewerMeetsTheRequirementsResolver(User $user, AbstractStep $step): bool
    {
        $requirements = $this->repository->getByStep($step);
        foreach ($requirements as $requirement) {
            if (!$this->viewerMeetsTheRequirementResolver->__invoke($requirement, $user)) {
                return false;
            }
        }

        return true;
    }
}
