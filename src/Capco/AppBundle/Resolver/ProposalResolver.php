<?php

namespace Capco\AppBundle\Resolver;

class ProposalResolver
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }
}
