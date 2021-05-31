<?php

namespace Capco\AppBundle\GraphQL\Resolver\UserInvite;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class UserInviteGroupsResolver implements ResolverInterface
{
    private LoggerInterface $logger;
    private GroupRepository $groupRepository;

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
                    ->toArray();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \Error('Error during fetching groups of ' . $userInvite->getEmail());
            }

            return $arguments;
        });

        return $paginator->auto($args, $totalCount);
    }
}
