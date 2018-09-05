<?php
namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SourceVotesResolver implements ResolverInterface
{
    private $repository;

    public function __construct(SourceVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Source $source, Arg $args): Connection
    {
        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($source) {
            return $this->repository->getByContribution($source, $limit, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $this->repository->countByContribution($source);

        return $paginator->auto($args, $totalCount);
    }
}
