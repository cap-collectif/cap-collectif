<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OpinionArgumentsResolver implements ResolverInterface
{
    private $argumentRepository;

    public function __construct(ArgumentRepository $argumentRepository)
    {
        $this->argumentRepository = $argumentRepository;
    }

    public function __invoke(Argumentable $argumentable, Argument $args): Connection
    {
        $type = $args->offsetGet('type');
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $argumentable,
            $type,
            $field,
            $direction
        ) {
            return $this->argumentRepository->getByContributionAndType(
                $argumentable,
                $type,
                $limit,
                $offset,
                $field,
                $direction
            )
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->argumentRepository->countByContributionAndType($argumentable, $type);

        return $paginator->auto($args, $totalCount);
    }
}
