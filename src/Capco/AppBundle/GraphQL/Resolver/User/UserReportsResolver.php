<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ReportingRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserReportsResolver implements QueryInterface
{
    protected $reportingRepo;

    public function __construct(ReportingRepository $reportingRepo)
    {
        $this->reportingRepo = $reportingRepo;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        $paginator = new Paginator(fn (?int $offset, ?int $limit) => $this->reportingRepo->findAllByUser($user));

        $totalCount = $this->reportingRepo->countAllByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
