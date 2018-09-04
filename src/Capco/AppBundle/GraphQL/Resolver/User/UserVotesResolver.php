<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserVotesResolver
{
    protected $votesRepo;

    public function __construct(AbstractVoteRepository $votesRepo)
    {
        $this->votesRepo = $votesRepo;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        $paginator = new Paginator(function (?int $limit, ?int $offset) use ($user) {
            return $this->votesRepo->findAllByAuthor($user, $limit, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $this->votesRepo->countAllByAuthor($user);

        return $paginator->auto($args, $totalCount);
    }
}
