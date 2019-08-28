<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ArgumentVotesResolver implements ResolverInterface
{
    private $repo;

    public function __construct(ArgumentVoteRepository $repo)
    {
        $this->repo = $repo;
    }

    public function __invoke(Argument $argument, Arg $args): ConnectionInterface
    {
        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($argument) {
            return $this->repo
                ->getByContribution($argument, $limit, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $this->repo->countByContribution($argument);

        return $paginator->auto($args, $totalCount);
    }
}
