<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class StepRequirementsResolver implements ResolverInterface
{
    private $repository;
    private $viewerMeetsTheRequirementResolver;

    public function __construct(RequirementRepository $repository, ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver)
    {
        $this->repository = $repository;
        $this->viewerMeetsTheRequirementResolver = $viewerMeetsTheRequirementResolver;
    }

    public function __invoke(AbstractStep $step, /* User|string */ $user, Argument $args): Connection
    {
        $requirements = $this->repository->getByStep($step);

        $connection = ConnectionBuilder::connectionFromArray($requirements, $args);
        $connection->totalCount = \count($requirements);

        if ($step instanceof SelectionStep || $step instanceof CollectStep) {
            $connection->{'reason'} = $step->getRequirementsReason();
        }
        $connection->{'viewerMeetsTheRequirements'} = false;

        if ($user instanceof User) {
            $connection->{'viewerMeetsTheRequirements'} = $this->viewerMeetsTheRequirementsResolver($user, $step);
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
