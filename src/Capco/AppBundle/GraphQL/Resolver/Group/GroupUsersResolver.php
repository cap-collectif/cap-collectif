<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class GroupUsersResolver implements QueryInterface
{
    public function __construct(
        private readonly UserRepository $userRepository
    ) {
    }

    public function __invoke(Group $group, Argument $args): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }
        $consentInternalCommunication = $args['consentInternalCommunication'];
        $emailConfirmed = $args['emailConfirmed'];
        $paginator = new Paginator(fn (?int $offset, ?int $limit) => $this->userRepository->getUsersInGroup(
            $group,
            $offset,
            $limit,
            $consentInternalCommunication,
            $emailConfirmed
        ));

        $totalCount = $this->userRepository->countUsersInGroup(
            $group,
            $consentInternalCommunication,
            $emailConfirmed
        );

        return $paginator->auto($args, $totalCount);
    }
}
