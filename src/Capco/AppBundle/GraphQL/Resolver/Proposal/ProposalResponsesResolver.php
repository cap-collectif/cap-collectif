<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalResponsesResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal, $user, \ArrayObject $context): iterable
    {
        $skipVerification =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $isAuthor = $proposal->getAuthor() === $user;
        $viewerCanSeePrivateResponses =
            $skipVerification || $isAuthor || ($user instanceof User && $user->isAdmin());

        $responses = $proposal
            ->getResponses()
            ->filter(function ($response) use ($viewerCanSeePrivateResponses) {
                return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
            });

        $iterator = $responses->getIterator();

        $iterator->uasort(function ($a, $b) {
            return $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition();
        });

        return $iterator;
    }
}
