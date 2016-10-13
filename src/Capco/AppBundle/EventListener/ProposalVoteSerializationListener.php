<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\ProposalVote;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\PreSerializeEvent;
use Symfony\Component\Translation\TranslatorInterface;

class ProposalVoteSerializationListener implements EventSubscriberInterface
{
    protected $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.pre_serialize',
                'class' => 'Capco\AppBundle\Entity\ProposalVote',
                'method' => 'onPreProposalVote',
            ],
        ];
    }

    public function onPreProposalVote(PreSerializeEvent $event)
    {
        $proposalVote = $event->getObject();

        if ($proposalVote->isPrivate()) {
            $proposalVote->setUser(null);
            $proposalVote->setEmail(null);
            $proposalVote->setUsername(ProposalVote::ANONYMOUS);
        }
    }
}
