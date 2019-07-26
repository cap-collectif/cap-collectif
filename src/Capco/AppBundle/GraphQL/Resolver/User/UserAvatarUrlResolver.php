<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserAvatarUrlResolver implements ResolverInterface
{
    private $urlResolver;

    public function __construct(MediaUrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(User $user): ?string
    {
        $media = $user->getMedia();
        if (!$media) {
            return null;
        }

        return $this->urlResolver->__invoke($media);
    }
}
