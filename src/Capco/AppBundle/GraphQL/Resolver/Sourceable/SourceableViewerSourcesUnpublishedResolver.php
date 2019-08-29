<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sourceable;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Sourceable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class SourceableViewerSourcesUnpublishedResolver implements ResolverInterface
{
    private $sourceRepository;
    private $builder;

    public function __construct(SourceRepository $sourceRepository, ConnectionBuilder $builder)
    {
        $this->sourceRepository = $sourceRepository;
        $this->builder = $builder;
    }

    public function __invoke(Sourceable $sourceable, Argument $args, User $viewer): Connection
    {
        $unpublished = $this->sourceRepository->getUnpublishedByContributionAndAuthor(
            $sourceable,
            $viewer
        );
        $connection = $this->builder->connectionFromArray($unpublished, $args);
        $connection->setTotalCount(\count($unpublished));

        return $connection;
    }
}
