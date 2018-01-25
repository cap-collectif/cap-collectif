<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\ConsultationResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\NewOpinionModeratorMessage;
use Capco\AppBundle\Mailer\Message\UpdateOpinionModeratorMessage;
use Capco\AppBundle\SiteParameter\Resolver;

class OpinionNotifier extends BaseNotifier
{
    protected $consultationResolver;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver, ConsultationResolver $consultationResolver)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->consultationResolver = $consultationResolver;
    }

    public function onCreation(Opinion $opinion)
    {
        $this->mailer->sendMessage(NewOpinionModeratorMessage::create(
          $opinion,
          $this->siteParams->getValue('admin.mail.notifications.send_address'),
          $this->siteParams->getValue('admin.mail.notifications.send_name'),
          $this->consultationResolver->resolvePropositionUrl($opinion),
          $this->userResolver->resolveUrl($opinion->getAuthor())
      ));
    }

    public function onUpdate(Opinion $opinion)
    {
        $this->mailer->sendMessage(UpdateOpinionModeratorMessage::create(
          $opinion,
          $this->siteParams->getValue('admin.mail.notifications.send_address'),
          $this->siteParams->getValue('admin.mail.notifications.send_name'),
          $this->consultationResolver->resolvePropositionUrl($opinion),
          $this->userResolver->resolveUrl($opinion->getAuthor())
      ));
    }
}
