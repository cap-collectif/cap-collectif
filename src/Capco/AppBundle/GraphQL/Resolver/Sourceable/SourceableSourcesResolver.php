<?php
namespace Capco\AppBundle\GraphQL\Resolver\Sourceable;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Sourceable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class SourceableSourcesResolver implements ResolverInterface
{
    private $sourceRepository;

    public function __construct(SourceRepository $sourceRepository)
    {
        $this->sourceRepository = $sourceRepository;
    }

    public function __invoke(Sourceable $sourceable, Argument $args, $viewer): Connection
    {
        // Viewer is asking for his unpublished
        if ($args->offsetGet('viewerUnpublishedOnly') === true) {
            if (!$viewer instanceof User) {
                $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
                $emptyConnection->totalCount = 0;
                return $emptyConnection;
            }
            $unpublished = $this->sourceRepository->getUnpublishedByContributionAndAuthor(
                $sourceable,
                $viewer
            );
            $connection = ConnectionBuilder::connectionFromArray($unpublished, $args);
            $connection->totalCount = \count($unpublished);
            return $connection;
        }

        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($sourceable, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            return $this->sourceRepository->getByContribution(
                $sourceable,
                $limit,
                $offset,
                $field,
                $direction
            )
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->sourceRepository->countByContribution($sourceable);

        return $paginator->auto($args, $totalCount);
    }
}
