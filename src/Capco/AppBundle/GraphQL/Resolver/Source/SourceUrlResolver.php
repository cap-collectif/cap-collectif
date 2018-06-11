<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Resolver\UrlResolver;

class SourceUrlResolver
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
