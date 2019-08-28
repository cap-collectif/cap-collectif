<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Opinion;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class OpinionViewerVersionsUnpublishedResolver implements ResolverInterface
{
    use ResolverTrait;

    private $logger;
    private $versionRepository;
    private $builder;

    public function __construct(
        OpinionVersionRepository $versionRepository,
        LoggerInterface $logger,
        ConnectionBuilder $builder
    ) {
        $this->logger = $logger;
        $this->versionRepository = $versionRepository;
        $this->builder = $builder;
    }

    public function __invoke(Opinion $opinion, Argument $args, ?User $viewer): Connection
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
