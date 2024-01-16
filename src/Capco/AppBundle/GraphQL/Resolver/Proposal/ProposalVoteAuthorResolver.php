<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalVoteAuthorResolver implements QueryInterface
{
    use ResolverTrait;

    public function __invoke(AbstractVote $vote, $viewer, \ArrayObject $context): ?User
    {
        return self::canSeeAnonymous($vote, $viewer, $context) ? $vote->getAuthor() : null;
    }

    private function canSeeAnonymous(AbstractVote $vote, $viewer, \ArrayObject $context): bool
    {
        return ($viewer instanceof User
            && $vote->getAuthor()
            && $viewer->getId() === $vote->getAuthor()->getId())
            || !$vote->isPrivate()
            || $this->isACLDisabled($context);
    }
}
