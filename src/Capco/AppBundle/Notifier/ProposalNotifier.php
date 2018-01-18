<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\NewProposalMessage;
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
        $this->mailer->sendMessage(NewProposalMessage::create(
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
