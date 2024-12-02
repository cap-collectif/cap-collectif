<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateUrlResolver implements QueryInterface
{
    public function __construct(private readonly UrlResolver $urlResolver)
    {
    }

    public function __invoke(Debate $debate): string
    {
        return $this->urlResolver->getObjectUrl($debate->getStep(), true);
    }
}
