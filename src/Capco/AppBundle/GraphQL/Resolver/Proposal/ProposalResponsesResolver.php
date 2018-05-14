<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalResponsesResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal, $user): iterable
    {
        $isAuthor = $proposal->getAuthor() === $user;
        $viewerCanSeePrivateResponses = $isAuthor || ($user instanceof User && $user->isAdmin());

        return $proposal->getResponses()->filter(
          function ($response) use ($viewerCanSeePrivateResponses) {
              return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
          }
        );
    }
}
