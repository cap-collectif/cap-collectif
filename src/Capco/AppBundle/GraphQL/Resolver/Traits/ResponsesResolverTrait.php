<?php

namespace Capco\AppBundle\GraphQL\Resolver\Traits;

use Capco\UserBundle\Entity\User;

trait ResponsesResolverTrait
{
    public function filterVisibleResponses(
        iterable $responses,
        User $author,
        $viewer,
        \ArrayObject $context
    ): iterable {
        $skipVerification =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $isAuthor = $author === $viewer;
        $viewerCanSeePrivateResponses =
            $skipVerification || $isAuthor || ($viewer instanceof User && $viewer->isAdmin());

        return $responses->filter(function ($response) use ($viewerCanSeePrivateResponses) {
            return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
        });
    }
}
