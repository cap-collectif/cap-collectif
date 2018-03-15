<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\GraphQL\Resolver\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalOfficialAnswerMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeInCollectMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeInSelectionMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalUpdateAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;

class ProposalNotifier extends BaseNotifier
{
    protected $proposalResolver;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver, ProposalResolver $proposalResolver)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->proposalResolver = $proposalResolver;
    }

    public function onCreate(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalCreateAdminMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor())
        ));
    }

    public function onDelete(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalDeleteAdminMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor())
        ));
    }

    public function onUpdate(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalUpdateAdminMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor())
        ));
    }

    public function onOfficialAnswer(Proposal $proposal, $post)
    {
        $this->mailer->sendMessage(ProposalOfficialAnswerMessage::create(
            $proposal,
            $post,
            $proposal->getAuthor()->getEmail()
        ));
    }

    public function onStatusChangeInCollect(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalStatusChangeInCollectMessage::create(
            $proposal,
            $proposal->getAuthor()->getEmail()
        ));
        foreach ($proposal->getChildConnections() as $child) {
            $this->mailer->sendMessage(ProposalStatusChangeInCollectMessage::create(
                $proposal,
                $child->getAuthor()->getEmail()
            ));
        }
    }

    public function onStatusChangeInSelection(Selection $selection)
    {
        $this->mailer->sendMessage(ProposalStatusChangeInSelectionMessage::create(
            $selection,
            $selection->getProposal()->getAuthor()->getEmail()
        ));
        foreach ($selection->getProposal()->getChildConnections() as $child) {
            $this->mailer->sendMessage(ProposalStatusChangeInSelectionMessage::create(
                $selection,
                $child->getAuthor()->getEmail()
            ));
        }
    }
}
