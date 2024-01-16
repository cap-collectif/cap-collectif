<?php

namespace Capco\AppBundle\GraphQL\Resolver\Vote;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PropositionVoteUserResolver implements QueryInterface
{
    public function __invoke(AbstractVote $vote): ?User
    {
        return $vote->getUser();
    }
}
