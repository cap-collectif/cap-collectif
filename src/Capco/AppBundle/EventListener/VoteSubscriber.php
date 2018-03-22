<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AbstractVoteChangedEvent;
use Capco\AppBundle\Event\OpinionVoteChangedEvent;
use Doctrine\ORM\EntityManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class VoteSubscriber implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::OPINION_VOTE_CHANGED => 'onOpinionVoteChanged',
            CapcoAppBundleEvents::ABSTRACT_VOTE_CHANGED => 'onAbstractVoteChanged',
        ];
    }

    public function onOpinionVoteChanged(OpinionVoteChangedEvent $event)
    {
        $opinionVote = $event->getVote();
        $action = $event->getAction();
        $opinion = $opinionVote->getOpinion();

        if ($action === 'remove') {
            $opinion->decreaseVotesCount($opinionVote->getValue());
        }

        if ($action === 'add') {
            $opinion->increaseVotesCount($opinionVote->getValue());
        }

        if ($action === 'update') {
            $opinion->increaseVotesCount($opinionVote->getValue());
            $opinion->decreaseVotesCount($event->getPrevious());
        }
    }

    public function onAbstractVoteChanged(AbstractVoteChangedEvent $event)
    {
        $vote = $event->getVote();
        $action = $event->getAction();
        $entity = $vote->getRelatedEntity();

        if ($action === 'remove') {
            $entity->decrementVotesCount();
        }

        if ($action === 'add') {
            $entity->incrementVotesCount();
        }
    }
}
