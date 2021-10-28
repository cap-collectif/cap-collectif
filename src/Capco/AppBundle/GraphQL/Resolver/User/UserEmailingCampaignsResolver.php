<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserEmailingCampaignsResolver implements ResolverInterface
{
    private EmailingCampaignRepository $repository;

    public function __construct(EmailingCampaignRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(User $viewer, Argument $argument): ConnectionInterface
    {
        self::checkAffiliation($viewer, $argument);

        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $viewer,
            $argument
        ) {
            $results = $this->repository->search(
                $offset,
                $limit,
                $argument->offsetGet('status'),
                $argument->offsetGet('orderBy')['field'],
                $argument->offsetGet('orderBy')['direction'],
                $argument->offsetGet('term'),
                $argument->offsetGet('affiliations') ?? [],
                $viewer
            );
            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($argument, $totalCount);
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
