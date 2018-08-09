<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Argumentable;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class OpinionArgumentsResolver implements ResolverInterface
{
    private $argumentRepository;

    public function __construct(ArgumentRepository $argumentRepository)
    {
        $this->argumentRepository = $argumentRepository;
    }

    public function __invoke(Argumentable $argumentable, Argument $args, $viewer): Connection
    {
        $type = $args->offsetGet('type');

        // Viewer is asking for his unpublished arguments
        if ($args->offsetGet('viewerUnpublishedOnly') === true) {
            if (!$viewer instanceof User) {
                $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
                $emptyConnection->totalCount = 0;
                return $emptyConnection;
            }
            $unpublishedArguments = $this->argumentRepository->getUnpublishedByContributionAndTypeAndAuthor(
                $argumentable,
                $type,
                $viewer
            );
            $connection = ConnectionBuilder::connectionFromArray($unpublishedArguments, $args);
            $connection->totalCount = \count($unpublishedArguments);
            return $connection;
        }

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $argumentable,
            $type,
            $args
        ) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            return $this->argumentRepository->getByContributionAndType(
                $argumentable,
                $type,
                $limit,
                $offset,
                $field,
                $direction
            )
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->argumentRepository->countByContributionAndType($argumentable, $type);

        return $paginator->auto($args, $totalCount);
    }
}
