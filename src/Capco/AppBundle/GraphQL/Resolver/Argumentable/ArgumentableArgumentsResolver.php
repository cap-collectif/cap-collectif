<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argumentable;

use Capco\AppBundle\Model\Argumentable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ArgumentableArgumentsResolver implements ResolverInterface
{
    private $argumentRepository;

    public function __construct(ArgumentRepository $argumentRepository)
    {
        $this->argumentRepository = $argumentRepository;
    }

    public function __invoke(Argumentable $argumentable, Argument $args): Connection
    {
        $type = $args->offsetGet('type');
        $includeTrashed = $args->offsetGet('includeTrashed');

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $argumentable,
            $type,
            $args,
            $includeTrashed
        ) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            return $this->argumentRepository
                ->getByContributionAndType(
                    $argumentable,
                    $type,
                    $limit,
                    $offset,
                    $field,
                    $direction,
                    $includeTrashed
                )
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->argumentRepository->countByContributionAndType(
            $argumentable,
            $type,
            $includeTrashed
        );

        return $paginator->auto($args, $totalCount);
    }
}
