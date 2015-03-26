<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Doctrine\ORM\EntityManager;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AddContributionEvent;

class ContributionSuscriber implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::AFTER_CONTRIBUTION_ADDED => 'onAdd'
        ];
    }

    public function onAdd(AddContributionEvent $event)
    {
        $user = $event->getUser();
        if (!$user) {
            return;
        }

        $counters = $this->em->getRepository('CapcoUserBundle:User')->getContributionCounters($user->getId());
        $user->updateContributionCounters($counters);

        $this->em->flush();
    }
}
