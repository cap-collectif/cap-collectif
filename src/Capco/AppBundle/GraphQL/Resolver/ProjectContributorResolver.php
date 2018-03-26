<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProjectContributorResolver
{
    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Project $project, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($project) {
            try {
                $contributorsId = $this->userRepository->getRegisteredContributorByProject($project, $offset, $limit);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException('Find following proposal by user failed');
            }

            return array_values(array_filter(array_map(function (array $criteria) {
                return $this->userRepository->findOneBy($criteria);
            }, $contributorsId), function (?User $user) {return null !== $user; }));
        });

        $totalCount = $this->userRepository->countContributorByProject($project);

        return $paginator->auto($args, $totalCount);
    }
}
