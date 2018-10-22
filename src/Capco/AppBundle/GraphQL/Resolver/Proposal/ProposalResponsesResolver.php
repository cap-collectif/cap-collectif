<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalResponsesResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal, $user, \ArrayObject $context): iterable
    {
        $skipVerification = $context && $context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl');
        $isAuthor = $proposal->getAuthor() === $user;
        $viewerCanSeePrivateResponses = $skipVerification || $isAuthor || ($user instanceof User && $user->isAdmin());

        return $proposal->getResponses()->filter(
          function ($response) use ($viewerCanSeePrivateResponses) {
              return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
          }
        );
    }
}
