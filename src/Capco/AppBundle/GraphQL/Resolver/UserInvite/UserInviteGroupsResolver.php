<?php

namespace Capco\AppBundle\GraphQL\Resolver\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Repository\GroupRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class UserInviteGroupsResolver implements QueryInterface
{
    private readonly LoggerInterface $logger;
    private readonly GroupRepository $groupRepository;

    public function __construct(GroupRepository $groupRepository, LoggerInterface $logger)
    {
        $this->groupRepository = $groupRepository;
        $this->logger = $logger;
    }

    public function __invoke(UserInvite $userInvite): ConnectionInterface
    {
        $totalCount = $userInvite->getGroups()->count();

        $args = new Argument([
            'first' => $totalCount,
        ]);

        $paginator = new Paginator(function () use ($userInvite) {
            try {
                $arguments = $userInvite
                    ->getGroups()
                    ->map(function ($group) {
                        return $group;
                    })
                    ->toArray()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \Error('Error during fetching groups of ' . $userInvite->getEmail());
            }

            return $arguments;
        });

        return $paginator->auto($args, $totalCount);
    }
}
