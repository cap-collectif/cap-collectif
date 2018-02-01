<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\Admin\ProposalCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Admin\ProposalDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Admin\ProposalUpdateAdminMessage;
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
}
