<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\AbstractVote as Vote;
use Capco\AppBundle\Resolver\VoteResolver;

class VoteExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(VoteResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_vote';
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('capco_vote_object_url', [$this, 'getRelatedObjectUrl']),
            new \Twig_SimpleFunction('capco_vote_object', [$this, 'getRelatedObject']),
            new \Twig_SimpleFunction('capco_vote_object_admin_url', [$this, 'getRelatedObjectAdminUrl']),
        ];
    }

    public function getRelatedObjectUrl(Vote $vote, $absolute = false)
    {
        return $this->resolver->getRelatedObjectUrl($vote, $absolute);
    }

    public function getRelatedObjectAdminUrl(Vote $vote, $absolute = false)
    {
        return $this->resolver->getRelatedObjectAdminUrl($vote, $absolute);
    }

    public function getRelatedObject(Vote $vote)
    {
        return $this->resolver->getRelatedObject($vote);
    }
}
