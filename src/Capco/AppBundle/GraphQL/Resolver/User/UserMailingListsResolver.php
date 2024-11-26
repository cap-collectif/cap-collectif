<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\MailingListRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserMailingListsResolver implements QueryInterface
{
    private readonly MailingListRepository $repository;

    public function __construct(MailingListRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(User $user, ?Argument $args = null): ConnectionInterface
    {
        self::checkAffiliation($user, $args);

        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $user,
            $args
        ) {
            $results = $this->repository->findPaginated(
                $limit,
                $offset,
                $args->offsetGet('term'),
                $args->offsetGet('affiliations') ?? [],
                $user
            );
            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private function checkAffiliation(User $viewer, Argument $args): void
    {
        if (!$viewer->isAdmin() && !$args->offsetGet('affiliations')) {
            throw new UserError('cannot request without affiliation');
        }
    }
}
