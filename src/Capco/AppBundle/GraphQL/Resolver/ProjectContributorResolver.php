<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProjectContributorResolver
{
    private $userSearch;
    private $logger;

    public function __construct(UserSearch $userSearch, LoggerInterface $logger)
    {
        $this->userSearch = $userSearch;
        $this->logger = $logger;
    }

    public function __invoke(Project $project, Arg $args): Connection
    {
        $totalCount = 0;

        $paginator = new Paginator(function ($offset, $limit) use (&$totalCount, $project) {
            try {
                $value = $this->userSearch->getContributorByProject($project, $offset, $limit);
                $contributors = $value['results'];
                $totalCount = $value['totalCount'];

                return $contributors;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException($exception->getMessage());
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        return $connection;
    }
}
