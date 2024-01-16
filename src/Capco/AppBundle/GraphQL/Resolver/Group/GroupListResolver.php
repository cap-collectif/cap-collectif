<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Repository\GroupRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class GroupListResolver implements QueryInterface
{
    private GroupRepository $groupRepository;

    public function __construct(GroupRepository $groupRepository)
    {
        $this->groupRepository = $groupRepository;
    }

    public function __invoke(Argument $args): Connection
    {
        $term = $args->offsetGet('term');
        $paginator = new Paginator(function () use ($term) {
            return $this->groupRepository->getByTerm($term);
        });

        $totalCount = $this->groupRepository->countAll();

        return $paginator->auto($args, $totalCount);
    }
}
