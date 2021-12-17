<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class GroupUsersResolver implements ResolverInterface
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function __invoke(Group $group, Argument $args): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }
        $consentInternalCommunication = $args['consentInternalCommunication'];
        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $group,
            $consentInternalCommunication
        ) {
            return $this->userRepository->getUsersInGroup(
                $group,
                $offset,
                $limit,
                $consentInternalCommunication
            );
        });

        $totalCount = $this->userRepository->countUsersInGroup(
            $group,
            $consentInternalCommunication
        );

        return $paginator->auto($args, $totalCount);
    }
}
