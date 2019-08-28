<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argumentable;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Argumentable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class ArgumentableViewerArgumentsUnpublishedResolver implements ResolverInterface
{
    private $argumentRepository;
    private $builder;

    public function __construct(ArgumentRepository $argumentRepository, ConnectionBuilder $builder)
    {
        $this->argumentRepository = $argumentRepository;
        $this->builder = $builder;
    }

    public function __invoke(Argumentable $argumentable, Argument $args, User $viewer): Connection
    {
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
