<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Repository\GroupRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class GroupListResolver implements QueryInterface
{
    public function __construct(
        private readonly GroupRepository $groupRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $term = $args->offsetGet('term');
        $paginator = new Paginator(fn (?int $offset = null, ?int $limit = null) => $this->groupRepository->getByTerm($offset, $limit, $term));

        $totalCount = $this->groupRepository->countAll();

        return $paginator->auto($args, $totalCount);
    }
}
