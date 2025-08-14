<?php

namespace Capco\AppBundle\GraphQL\Resolver\Vote;

use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PropositionVoteUserResolver implements QueryInterface
{
    use ResolverTrait;

    public function __invoke(AbstractVote $vote, \ArrayObject $context, ?User $viewer = null): ?Author
    {
        if ($vote instanceof AbstractProposalVote) {
            return self::canSeeAnonymous($vote, $context, $viewer) ? $vote->getAuthor() : null;
        }

        return $vote->getAuthor();
    }

    private function canSeeAnonymous(AbstractVote $vote, \ArrayObject $context, ?User $viewer = null): bool
    {
        return ($viewer instanceof User
                && $vote->getAuthor()
                && $viewer->getId() === $vote->getAuthor()->getId())
            || !$vote->isPrivate()
            || $this->isACLDisabled($context);
    }
}
