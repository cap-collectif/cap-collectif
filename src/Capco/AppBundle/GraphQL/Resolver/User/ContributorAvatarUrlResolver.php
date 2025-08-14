<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ContributorAvatarUrlResolver implements QueryInterface
{
    public function __construct(private readonly MediaUrlResolver $urlResolver)
    {
    }

    public function __invoke(ContributorInterface|Author $contributor): ?string
    {
        $media = $contributor->getMedia();
        if (!$media) {
            return null;
        }

        return $this->urlResolver->__invoke($media);
    }
}
