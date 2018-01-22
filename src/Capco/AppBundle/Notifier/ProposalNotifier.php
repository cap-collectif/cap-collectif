<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalCreateMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalDeleteMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalUpdateMessage;
use Capco\AppBundle\SiteParameter\Resolver;

class ProposalNotifier
{
    protected $mailer;
    protected $siteParams;
    protected $proposalResolver;
    protected $userResolver;

    public function __construct(MailerService $mailer, Resolver $siteParams, ProposalResolver $proposalResolver, UserResolver $userResolver)
    {
        $this->mailer = $mailer;
        $this->siteParams = $siteParams;
        $this->proposalResolver = $proposalResolver;
        $this->userResolver = $userResolver;
    }

    public function onCreate(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalCreateMessage::create(
          $proposal,
          $this->siteParams->getValue('admin.mail.notifications.send_address'),
          $this->siteParams->getValue('admin.mail.notifications.send_name'),
          $this->proposalResolver->resolveShowUrl($proposal),
          $this->proposalResolver->resolveAdminUrl($proposal),
          $this->userResolver->resolveShowUrl($proposal->getAuthor()),
          $this->siteParams->getValue('global.site.fullname')
        ));
    }

    public function onDelete(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalDeleteMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.send_address'),
            $this->siteParams->getValue('admin.mail.notifications.send_name'),
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor()),
            $this->siteParams->getValue('global.site.fullname')
        ));
    }

    public function onUpdate(Proposal $proposal)
    {
        $this->mailer->sendMessage(ProposalUpdateMessage::create(
            $proposal,
            $this->siteParams->getValue('admin.mail.notifications.send_address'),
            $this->siteParams->getValue('admin.mail.notifications.send_name'),
            $this->proposalResolver->resolveShowUrl($proposal),
            $this->proposalResolver->resolveAdminUrl($proposal),
            $this->userResolver->resolveShowUrl($proposal->getAuthor()),
            $this->siteParams->getValue('global.site.fullname')
        ));
    }
}
