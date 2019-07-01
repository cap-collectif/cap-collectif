<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserVotesResolver implements ResolverInterface
{
    protected $votesRepo;

    public function __construct(AbstractVoteRepository $votesRepo)
    {
        $this->votesRepo = $votesRepo;
    }

    public function __invoke(User $user, Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }

        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($user) {
            return $this->votesRepo->findAllByAuthor($user, $limit, $offset);
        });

        $totalCount = $this->votesRepo->countAllByAuthor($user);

        return $paginator->auto($args, $totalCount);
    }
}
