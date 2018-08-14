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

class OpinionViewerVersionsUnpublishedResolver implements ResolverInterface
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

    public function __invoke(Opinion $opinion, Argument $args, User $viewer): Connection
    {
        $unpublished = $this->versionRepository->getUnpublishedByContributionAndAuthor(
            $opinion,
            $viewer
        );
        $connection = ConnectionBuilder::connectionFromArray($unpublished, $args);
        $connection->totalCount = \count($unpublished);

        return $connection;
    }
}
