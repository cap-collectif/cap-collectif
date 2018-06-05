<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;

class UserVotesResolver
{
    protected $votesRepo;

    public function __construct(AbstractVoteRepository $votesRepo)
    {
        $this->votesRepo = $votesRepo;
    }

    public function __invoke(User $user): array
    {
        return $this->votesRepo->findBy(['user' => $user]);
    }
}
