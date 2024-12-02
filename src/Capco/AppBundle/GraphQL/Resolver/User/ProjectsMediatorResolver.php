<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ProjectsMediatorResolver implements QueryInterface
{
    public function __construct(private readonly ProjectRepository $projectRepository, private readonly ConnectionBuilder $connectionBuilder)
    {
    }

    public function __invoke(User $user, Argument $args): ConnectionInterface
    {
        $projects = $this->projectRepository->findMediatorProjectsByUser($user);

        $connection = $this->connectionBuilder->connectionFromArray($projects, $args);
        $connection->setTotalCount(\count($projects));

        return $connection;
    }
}
