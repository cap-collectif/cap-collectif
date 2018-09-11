<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SourceUrlResolver implements ResolverInterface
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(Source $comment): string
    {
        return $this->urlResolver->getObjectUrl($comment, true);
    }
}
