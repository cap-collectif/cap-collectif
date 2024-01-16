<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserAvatarUrlResolver implements QueryInterface
{
    private MediaUrlResolver $urlResolver;

    public function __construct(MediaUrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(Author $author): ?string
    {
        $media = $author->getMedia();
        if (!$media) {
            return null;
        }

        return $this->urlResolver->__invoke($media);
    }
}
