<?php
namespace Capco\AppBundle\GraphQL\Resolver\Argumentable;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Argumentable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class ArgumentableViewerArgumentsUnpublishedResolver implements ResolverInterface
{
    private $argumentRepository;

    public function __construct(ArgumentRepository $argumentRepository)
    {
        $this->argumentRepository = $argumentRepository;
    }

    public function __invoke(Argumentable $argumentable, Argument $args, User $viewer): Connection
    {
        $type = $args->offsetGet('type');

        $unpublishedArguments = $this->argumentRepository->getUnpublishedByContributionAndTypeAndAuthor(
            $argumentable,
            $type,
            $viewer
        );

        $connection = ConnectionBuilder::connectionFromArray($unpublishedArguments, $args);
        $connection->totalCount = \count($unpublishedArguments);
        return $connection;
    }
}
