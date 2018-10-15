<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OpinionVersionsResolver implements ResolverInterface
{
    private $versionRepository;

    public function __construct(OpinionVersionRepository $versionRepository)
    {
        $this->versionRepository = $versionRepository;
    }

    public function __invoke(Opinion $opinion, Argument $args): Connection
    {
        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($opinion, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            return $this->versionRepository->getByContribution(
                $opinion,
                $limit,
                $offset,
                $field,
                $direction
            )
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->versionRepository->countByContribution($opinion);

        return $paginator->auto($args, $totalCount);
    }
}
