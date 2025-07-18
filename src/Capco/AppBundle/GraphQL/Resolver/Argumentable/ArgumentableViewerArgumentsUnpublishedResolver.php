<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argumentable;

use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ArgumentableViewerArgumentsUnpublishedResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private ArgumentRepository $argumentRepository, private readonly ConnectionBuilderInterface $builder)
    {
    }

    public function __invoke(
        Argumentable $argumentable,
        Argument $args,
        $viewer
    ): ConnectionInterface {
        $viewer = $this->preventNullableViewer($viewer);

        $type = $args->offsetGet('type');

        $unpublishedArguments = $this->argumentRepository->getUnpublishedByContributionAndTypeAndAuthor(
            $argumentable,
            $type,
            $viewer
        );

        $connection = $this->builder->connectionFromArray($unpublishedArguments, $args);
        $connection->setTotalCount(\count($unpublishedArguments));

        return $connection;
    }
}
