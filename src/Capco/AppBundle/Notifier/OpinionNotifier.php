<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\ConsultationResolver;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Opinion\NewOpinionModeratorMessage;
use Capco\AppBundle\Mailer\Message\Opinion\TrashedOpinionAuthorMessage;
use Capco\AppBundle\Mailer\Message\Opinion\UpdateOpinionModeratorMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

class OpinionNotifier extends BaseNotifier
{
    protected $consultationResolver;
    protected $router;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        OpinionUrlResolver $consultationResolver,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->consultationResolver = $consultationResolver;
        $this->router = $router;
    }

    public function onCreation(Opinion $opinion)
    {
        $step = $opinion->getStep();

        if ($step->isModeratingOnCreate()) {
            $this->mailer->sendMessage(
                NewOpinionModeratorMessage::create(
                    $opinion,
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    null,
                    $this->consultationResolver->__invoke($opinion),
                    $this->userResolver->resolveShowUrl($opinion->getAuthor()),
                    $this->router
                )
            );
        }
    }

    public function onUpdate(Opinion $opinion)
    {
        $step = $opinion->getStep();

        if ($step->isModeratingOnUpdate()) {
            $this->mailer->sendMessage(
                UpdateOpinionModeratorMessage::create(
                    $opinion,
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    null,
                    $this->consultationResolver->__invoke($opinion),
                    $this->userResolver->resolveShowUrl($opinion->getAuthor()),
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
