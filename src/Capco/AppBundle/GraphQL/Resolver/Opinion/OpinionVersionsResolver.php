<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionVersionsResolver implements ResolverInterface
{
    private $logger;
    private $versionRepository;

    public function __construct(
        OpinionVersionRepository $versionRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->versionRepository = $versionRepository;
    }

    public function __invoke(Opinion $opinion, Argument $args): Connection
    {
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $opinion,
            $field,
            $direction
        ) {
            return $this->versionRepository
                ->getByContribution($opinion, $limit, $offset, $field, $direction)
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->versionRepository->countByContribution($opinion);

        return $paginator->auto($args, $totalCount);
    }
}
