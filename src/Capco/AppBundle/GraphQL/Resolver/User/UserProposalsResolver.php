<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserProposalsResolver implements ResolverInterface
{
    private $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
            return $this->proposalRepository->getByUser($user);
        });

        $totalCount = $this->proposalRepository->countByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
