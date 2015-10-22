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

    /**
     * @param Proposal|null $proposal
     * @param bool|false $absolute
     * @return bool|string
     */
    public function getAdminLink(Proposal $proposal = null, $absolute = false)
    {
        return $this->urlResolver->getAdminObjectUrl($proposal, $absolute);
    }
}
