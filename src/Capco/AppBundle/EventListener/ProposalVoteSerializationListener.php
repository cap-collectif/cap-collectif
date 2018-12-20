<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\ProposalSelectionVote;
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

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.pre_serialize',
                'class' => 'Capco\AppBundle\Entity\ProposalSelectionVote',
                'method' => 'onPreProposalVote',
            ],
            [
                'event' => 'serializer.pre_serialize',
                'class' => 'Capco\AppBundle\Entity\ProposalCollectVote',
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
            $proposalVote->setUsername(ProposalSelectionVote::ANONYMOUS);
        }
    }
}
