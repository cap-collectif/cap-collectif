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

class SourceableViewerSourcesUnpublishedResolver implements ResolverInterface
{
    private $sourceRepository;

    public function __construct(SourceRepository $sourceRepository)
    {
        $this->sourceRepository = $sourceRepository;
    }

    public function __invoke(Sourceable $sourceable, Argument $args, User $viewer): Connection
    {
        $unpublished = $this->sourceRepository->getUnpublishedByContributionAndAuthor(
            $sourceable,
            $viewer
        );
        $connection = ConnectionBuilder::connectionFromArray($unpublished, $args);
        $connection->totalCount = \count($unpublished);
        return $connection;
    }
}
