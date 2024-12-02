<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserOpinionVoteCountResolver implements QueryInterface
{
    public function __construct(private readonly OpinionVoteRepository $opinionVoteRepository)
    {
    }

    public function __invoke($viewer, User $user): int
    {
        return $this->opinionVoteRepository->countVotesByAuthor($user);
    }
}
