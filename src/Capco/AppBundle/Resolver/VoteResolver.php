<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\AbstractVote as Vote;
use Symfony\Component\Routing\RouterInterface;

class VoteResolver
{
    protected $router;
    protected $urlResolver;

    public function __construct(RouterInterface $router, UrlResolver $urlResolver)
    {
        $this->router = $router;
        $this->urlResolver = $urlResolver;
    }

    public function getRelatedObject(Vote $vote)
    {
        return $vote->getRelated();
    }

    public function getRelatedObjectUrl(Vote $vote, $absolute = false)
    {
        $object = $this->getRelatedObject($vote);

        return $this->urlResolver->getObjectUrl($object, $absolute);
    }

    public function getRelatedObjectAdminUrl(Vote $vote, $absolute = false)
    {
        $object = $this->getRelatedObject($vote);

        return $this->urlResolver->getAdminObjectUrl($object, $absolute);
    }
}
