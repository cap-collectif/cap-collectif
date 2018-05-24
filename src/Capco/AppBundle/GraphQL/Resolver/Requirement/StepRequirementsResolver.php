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

    public function __contruct(RequirementRepository $repository, ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver)
    {
        $this->repository = $repository;
        $this->viewerMeetsTheRequirementResolver = $viewerMeetsTheRequirementResolver;
    }

    public function __invoke(AbstractStep $step, $user, Argument $args): Connection
    {
        $requirements = $this->repository->getByStep($step);

        $connection = ConnectionBuilder::connectionFromArray($requirements, $args);
        $connection->totalCount = \count($requirements);

        if ($step instanceof SelectionStep || $step instanceof CollectStep) {
            $connection->{'reason'} = $step->getRequirementsReason();
        }
        $connection->{'viewerMeetsTheRequirements'} = false;

        if ($user instanceof User) {
            $viewerMeetsTheRequirements = true;
            foreach ($requirements as $requirement) {
                if (!$this->viewerMeetsTheRequirementResolver->__invoke($requirement, $user)) {
                    $viewerMeetsTheRequirements = false;
                }
            }
            $connection->{'viewerMeetsTheRequirements'} = $viewerMeetsTheRequirements;
        }

        return $connection;
    }
}
