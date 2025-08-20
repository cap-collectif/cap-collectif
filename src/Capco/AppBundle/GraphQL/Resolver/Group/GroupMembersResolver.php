<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Repository\GroupRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class GroupMembersResolver implements QueryInterface
{
    public function __construct(private readonly GroupRepository $groupRepository)
    {
    }

    public function __invoke(Group $group, Argument $args): ConnectionInterface|Promise
    {
        $term = $args->offsetGet('term') ?? '';
        $paginator = new Paginator(
            function (?int $offset = 0, ?int $limit = 10000) use ($group, $term) {
                $limit = $limit ?: 10000;

                return $this->groupRepository->getMembers($group, $term, $offset, $limit);
            }
        );

        $totalCount = $this->groupRepository->countMembers($group, $term);

        return $paginator->auto($args, $totalCount);
    }
}
