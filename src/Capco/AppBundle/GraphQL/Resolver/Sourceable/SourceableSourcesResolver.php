<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sourceable;

use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SourceableSourcesResolver implements QueryInterface
{
    public function __construct(
        private readonly SourceRepository $sourceRepository
    ) {
    }

    public function __invoke(Sourceable $sourceable, Argument $args): Connection
    {
        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($sourceable, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            return $this->sourceRepository
                ->getByContribution($sourceable, $limit, $offset, $field, $direction)
                ->getIterator()
                ->getArrayCopy()
            ;
        });
        $totalCount = $this->sourceRepository->countByContribution($sourceable);

        return $paginator->auto($args, $totalCount);
    }
}
