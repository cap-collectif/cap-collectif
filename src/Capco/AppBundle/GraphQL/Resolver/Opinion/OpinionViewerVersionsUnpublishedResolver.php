<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Psr\Log\LoggerInterface;

class OpinionViewerVersionsUnpublishedResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private OpinionVersionRepository $versionRepository, private LoggerInterface $logger, private ConnectionBuilder $builder)
    {
    }

    public function __invoke(Opinion $opinion, Argument $args, $viewer): Connection
    {
        $viewer = $this->preventNullableViewer($viewer);
        $unpublished = $this->versionRepository->getUnpublishedByContributionAndAuthor(
            $opinion,
            $viewer
        );
        $connection = $this->builder->connectionFromArray($unpublished, $args);
        $connection->setTotalCount(\count($unpublished));

        return $connection;
    }
}
