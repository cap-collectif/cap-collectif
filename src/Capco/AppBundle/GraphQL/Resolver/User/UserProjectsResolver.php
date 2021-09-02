<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProjectOrderField;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserProjectsResolver implements ResolverInterface
{
    private ProjectRepository $projectRepository;
    private LoggerInterface $logger;

    public function __construct(ProjectRepository $projectRepository, LoggerInterface $logger)
    {
        $this->projectRepository = $projectRepository;
        $this->logger = $logger;
    }

    public function __invoke(User $user, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
                'affiliations' => ['AUTHOR'],
            ]);
        }

        $affiliations = $args['affiliations'];
        $query = $args->offsetGet('query');

        $field = $args->offsetGet('orderBy')['field'] ?? ProjectOrderField::PUBLISHED_AT;
        $orderByField = ProjectOrderField::SORT_FIELD[$field];
        $orderByDirection = $args->offsetGet('orderBy')['direction'] ?? OrderDirection::DESC;

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $user,
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection
        ) {
            try {
                $arguments = $this->projectRepository
                    ->getByUserPublicPaginated(
                        $user,
                        $offset,
                        $limit,
                        $affiliations,
                        $query,
                        $orderByField,
                        $orderByDirection
                    )
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = $this->projectRepository->countPublicPublished(
            $user,
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection
        );

        return $paginator->auto($args, $totalCount);
    }
}
