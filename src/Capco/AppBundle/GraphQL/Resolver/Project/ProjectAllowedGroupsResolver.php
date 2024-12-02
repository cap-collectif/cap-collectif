<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProjectAllowedGroupsResolver implements QueryInterface
{
    public function __construct(private readonly UserRepository $userRepository, private readonly GroupRepository $groupRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Project $project, Argument $args): Connection
    {
        try {
            $paginator = new Paginator(function (?int $offset, ?int $limit) use ($project) {
                return $this->groupRepository
                    ->getAllowedUserGroupForProject($project, $offset, $limit)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            });

            $totalUsersInGroups = $this->userRepository->countAllowedViewersForProject($project);
            $totalCount = $this->groupRepository->countGroupsAllowedForProject($project);

            $connection = $paginator->auto($args, $totalCount);
            $connection->totalUserCount = $totalUsersInGroups;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find allowed user groups for this project');
        }
    }
}
