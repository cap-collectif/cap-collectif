<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Opinion;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

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

    public function __invoke(Opinion $opinion, Argument $args, $viewer): Connection
    {
        // Viewer is asking for his unpublished
        if ($args->offsetGet('viewerUnpublishedOnly') === true) {
            if (!$viewer instanceof User) {
                $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
                $emptyConnection->totalCount = 0;
                return $emptyConnection;
            }
            $unpublished = $this->versionRepository->getUnpublishedByContributionAndAuthor(
                $opinion,
                $viewer
            );
            $connection = ConnectionBuilder::connectionFromArray($unpublished, $args);
            $connection->totalCount = \count($unpublished);
            return $connection;
        }
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
