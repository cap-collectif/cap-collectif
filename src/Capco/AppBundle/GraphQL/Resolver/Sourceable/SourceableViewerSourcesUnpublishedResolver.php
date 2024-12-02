<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sourceable;

use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class SourceableViewerSourcesUnpublishedResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private SourceRepository $sourceRepository, private ConnectionBuilder $builder)
    {
    }

    public function __invoke(Sourceable $sourceable, Argument $args, $viewer): ConnectionInterface
    {
        $viewer = $this->preventNullableViewer($viewer);

        $unpublished = $this->sourceRepository->getUnpublishedByContributionAndAuthor(
            $sourceable,
            $viewer
        );
        $connection = $this->builder->connectionFromArray($unpublished, $args);
        $connection->setTotalCount(\count($unpublished));

        return $connection;
    }
}
