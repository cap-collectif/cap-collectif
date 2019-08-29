<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sourceable;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Model\Sourceable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class SourceableViewerSourcesUnpublishedResolver implements ResolverInterface
{
    use ResolverTrait;

    private $sourceRepository;
    private $builder;

    public function __construct(SourceRepository $sourceRepository, ConnectionBuilder $builder)
    {
        $this->sourceRepository = $sourceRepository;
        $this->builder = $builder;
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
