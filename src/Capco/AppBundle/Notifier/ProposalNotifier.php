<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\Admin\ProposalCreateMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Admin\ProposalDeleteMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Admin\ProposalUpdateMessage;
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
        $this->mailer->sendMessage(ProposalCreateMessage::create(
          $proposal,
          $this->siteParams->getValue('admin.mail.notifications.receive_address'),
          null,
          $this->proposalResolver->resolveShowUrl($proposal),
          $this->proposalResolver->resolveAdminUrl($proposal),
          $this->userResolver->resolveShowUrl($proposal->getAuthor()),
          $this->siteParams->getValue('global.site.fullname'),
          $this->siteParams->getValue('admin.mail.notifications.send_address'),
          $this->siteParams->getValue('admin.mail.notifications.send_name')
        ));
    }

    public function onDelete(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalDeleteMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
            null,
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor()),
            $this->siteParams->getValue('global.site.fullname'),
            $this->siteParams->getValue('admin.mail.notifications.send_address'),
            $this->siteParams->getValue('admin.mail.notifications.send_name')
        ));
    }

    public function onUpdate(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalUpdateMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
            null,
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor()),
            $this->siteParams->getValue('global.site.fullname'),
            $this->siteParams->getValue('admin.mail.notifications.send_address'),
            $this->siteParams->getValue('admin.mail.notifications.send_name')
        ));
    }
}
