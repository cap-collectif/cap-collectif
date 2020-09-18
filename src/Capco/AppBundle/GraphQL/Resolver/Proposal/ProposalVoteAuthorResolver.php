<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalVoteAuthorResolver implements ResolverInterface
{
    use ResolverTrait;

    public function __invoke(AbstractVote $vote, \ArrayObject $context)
    {
        return self::canSeeAnonymous($vote, $context) ? $vote->getAuthor() : null;
    }

    private function canSeeAnonymous(AbstractVote $vote, \ArrayObject $context): bool
    {
        return !$vote->isPrivate() || $this->isACLDisabled($context);
    }
}
