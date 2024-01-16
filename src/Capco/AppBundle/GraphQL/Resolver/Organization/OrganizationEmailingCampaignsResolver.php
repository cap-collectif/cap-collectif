<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OrganizationEmailingCampaignsResolver implements QueryInterface
{
    private EmailingCampaignRepository $repository;

    public function __construct(EmailingCampaignRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Organization $organization, Argument $argument): ConnectionInterface
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $organization,
            $argument
        ) {
            $status = $argument->offsetGet('status');
            $results = $this->repository->findByOwner(
                $organization,
                $offset,
                $limit,
                $status,
                $argument->offsetGet('orderBy')['field'],
                $argument->offsetGet('orderBy')['direction'],
                $argument->offsetGet('term')
            );
            $totalCount = $this->repository->countByOwner($organization, $status);

            return $results;
        });

        $connection = $paginator->auto($argument, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
