<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Repository\DebateOpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class DebateOpinionsResolver implements ResolverInterface
{
    private DebateOpinionRepository $repository;

    public function __construct(DebateOpinionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Debate $debate, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($debate) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $this->repository
                ->getByDebate($debate, $limit, $offset)
                ->getIterator()
                ->getArrayCopy()
            ;
        });
        $totalCount = $this->repository->countByDebate($debate);

        return $paginator->auto($args, $totalCount);
    }
}
