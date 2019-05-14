<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserAvatarUrlResolver implements ResolverInterface
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(User $user): ?string
    {
        $media = $user->getMedia();
        if (!$media) {
            return null;
        }

        return $this->urlResolver->getMediaUrl($media);
    }
}
