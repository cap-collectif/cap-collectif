<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\AbstractComment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\AbstractVote as Vote;
use Capco\AppBundle\Manager\CommentResolver;
use Symfony\Component\Routing\Router;

class VoteResolver
{
    protected $router;
    protected $urlResolver;

    public function __construct(Router $router, UrlResolver $urlResolver)
    {
        $this->router = $router;
        $this->urlResolver = $urlResolver;
    }

    public function getRelatedObject(Vote $vote)
    {
        return $vote->getRelatedEntity();
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
