<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AbstractVoteChangedEvent;
use Capco\AppBundle\Event\OpinionVoteChangedEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class VoteSubscriber implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents(): array
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

        if ('remove' === $action) {
            $opinion->decreaseVotesCount($opinionVote->getValue());
        }

        if ('add' === $action) {
            $opinion->increaseVotesCount($opinionVote->getValue());
        }

        if ('update' === $action) {
            $opinion->increaseVotesCount($opinionVote->getValue());
            $opinion->decreaseVotesCount($event->getPrevious());
        }
    }

    public function onAbstractVoteChanged(AbstractVoteChangedEvent $event)
    {
        $vote = $event->getVote();
        $action = $event->getAction();
        $entity = $vote->getRelated();

        if ('remove' === $action) {
            $entity->decrementVotesCount();
        }

        if ('add' === $action) {
            $entity->incrementVotesCount();
        }
    }
}
