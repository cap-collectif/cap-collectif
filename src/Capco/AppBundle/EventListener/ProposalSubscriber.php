<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Manager\Notify;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\ProposalEvent;

class ProposalSubscriber implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManager $em, Notify $notifier)
    {
        $this->em       = $em;
        $this->notifier = $notifier;
    }

    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::PROPOSAL_DELETED => 'onProposalDeleted',
        ];
    }

    public function onProposalDeleted(ProposalEvent $event)
    {
        $proposal = $event->getProposal();
        $action   = $event->getAction();

        if ($action == 'remove') {
            $this->notifier->notifyProposalDeletion($proposal);
        }
    }
}
