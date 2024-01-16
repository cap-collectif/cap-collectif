<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserOpinionVoteCountResolver implements QueryInterface
{
    private $opinionVoteRepository;

    public function __construct(OpinionVoteRepository $opinionVoteRepository)
    {
        $this->opinionVoteRepository = $opinionVoteRepository;
    }

    public function __invoke($viewer, User $user): int
    {
        return $this->opinionVoteRepository->countVotesByAuthor($user);
    }
}
