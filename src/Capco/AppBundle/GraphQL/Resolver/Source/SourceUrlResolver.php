<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SourceUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly UrlResolver $urlResolver
    ) {
    }

    public function __invoke(Source $comment): string
    {
        return $this->urlResolver->getObjectUrl($comment, true);
    }
}
