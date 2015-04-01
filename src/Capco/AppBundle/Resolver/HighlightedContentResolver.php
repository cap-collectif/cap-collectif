<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Highlighted;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Toggle\Manager;

class HighlightedContentResolver extends PositionableResolver
{
    public function __construct(HighlightedContentRepository $repository, Manager $toggleManager)
    {
        parent::__construct($repository, $toggleManager);
    }

    // /**
    //  * @return array
    //  */
    // public function getHighlightedContent()
    // {
    //     $events = $em->getRepository('CapcoAppBundle:Event')->getHighlighted();
    //     $posts = $em->getRepository('CapcoAppBundle:Post')->getHighlighted();
    //     $ideas = $em->getRepository('CapcoAppBundle:Idea')->getHighlighted();
    //     $consultations = $em->getRepository('CapcoAppBundle:Consultation')->getHighlighted();
    //     $themes = $em->getRepository('CapcoAppBundle:Theme')->getHighlighted();

    //     $highlighteds = [];

    //     foreach ($events as $event) {
    //         $highlighteds[] = $event;
    //     }

    //     return $highlighteds;
    // }
}
