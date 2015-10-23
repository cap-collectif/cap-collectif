<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Proposals;

class ProposalResolver
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }
}
