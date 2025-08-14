<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalVoteContributorResolver implements QueryInterface
{
    use ResolverTrait;

    public function __invoke(AbstractProposalVote $vote, $viewer, \ArrayObject $context): ?ContributorInterface
    {
        if (!$viewer) {
            return $vote->getParticipant();
        }

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
