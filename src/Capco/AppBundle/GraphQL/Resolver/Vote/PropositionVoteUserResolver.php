<?php

namespace Capco\AppBundle\GraphQL\Resolver\Vote;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PropositionVoteUserResolver implements ResolverInterface
{
    public function __invoke(AbstractVote $vote): ?User
    {
        return $vote->getUser();
    }
}
