<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Opinion\NewOpinionModeratorMessage;
use Capco\AppBundle\Mailer\Message\Opinion\TrashedOpinionAuthorMessage;
use Capco\AppBundle\Mailer\Message\Opinion\UpdateOpinionModeratorMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

class OpinionNotifier extends BaseNotifier
{
    protected $consultationResolver;
    protected $userUrlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        OpinionUrlResolver $consultationResolver,
        RouterInterface $router,
        UserUrlResolver $userUrlResolver
    ) {
        parent::__construct($mailer, $siteParams, $router);
        $this->consultationResolver = $consultationResolver;
        $this->userUrlResolver = $userUrlResolver;
    }

    public function onCreation(Opinion $opinion)
    {
        $consultation = $opinion->getConsultation();

        if ($consultation && $consultation->isModeratingOnCreate()) {
            $this->mailer->sendMessage(
                NewOpinionModeratorMessage::create(
                    $opinion,
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    null,
                    $this->consultationResolver->__invoke($opinion),
                    $this->userUrlResolver->__invoke($opinion->getAuthor()),
                    $this->router
                )
            );
        }
    }

    public function onUpdate(Opinion $opinion)
    {
        $consultation = $opinion->getConsultation();

        if ($consultation && $consultation->isModeratingOnUpdate()) {
            $this->mailer->sendMessage(
                UpdateOpinionModeratorMessage::create(
                    $opinion,
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    null,
                    $this->consultationResolver->__invoke($opinion),
                    $this->userUrlResolver->__invoke($opinion->getAuthor()),
                    $this->router
                )
            );
        }
    }

    public function onTrash(Opinion $opinion)
    {
        $this->mailer->sendMessage(
            TrashedOpinionAuthorMessage::create(
                $opinion,
                $this->consultationResolver->__invoke($opinion)
            )
        );
    }
}
