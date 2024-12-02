<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Opinion\NewOpinionModeratorMessage;
use Capco\AppBundle\Mailer\Message\Opinion\TrashedOpinionAuthorMessage;
use Capco\AppBundle\Mailer\Message\Opinion\UpdateOpinionModeratorMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

class OpinionNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        protected OpinionUrlResolver $consultationResolver,
        RouterInterface $router,
        protected UserUrlResolver $userUrlResolver,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onCreation(Opinion $opinion)
    {
        $consultation = $opinion->getConsultation();

        if ($consultation && $consultation->isModeratingOnCreate()) {
            $this->mailer->createAndSendMessage(NewOpinionModeratorMessage::class, $opinion, [
                'authorURL' => $this->userUrlResolver->__invoke($opinion->getAuthor()),
                'moderableURL' => $this->consultationResolver->__invoke($opinion),
            ]);
        }
    }

    public function onUpdate(Opinion $opinion)
    {
        $consultation = $opinion->getConsultation();

        if ($consultation && $consultation->isModeratingOnUpdate()) {
            $this->mailer->createAndSendMessage(UpdateOpinionModeratorMessage::class, $opinion, [
                'authorURL' => $this->userUrlResolver->__invoke($opinion->getAuthor()),
                'moderableURL' => $this->consultationResolver->__invoke($opinion),
            ]);
        }
    }

    public function onTrash(Opinion $opinion)
    {
        $this->mailer->createAndSendMessage(
            TrashedOpinionAuthorMessage::class,
            $opinion,
            ['elementURL' => $this->consultationResolver->__invoke($opinion)],
            $opinion->getAuthor()
        );
    }
}
