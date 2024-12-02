<?php

namespace Capco\AppBundle\Notifier\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Mediator\MediatorPubParticipateMessage;
use Capco\AppBundle\Notifier\BaseNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class MediatorNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        private readonly StepUrlResolver $stepUrlResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onMediatorAddNewParticipant(Mediator $mediator, Participant $participant)
    {
        $this->mailer->createAndSendMessage(
            MediatorPubParticipateMessage::class,
            $mediator,
            [
                'baseUrl' => $this->getBaseUrl(),
                'siteName' => $this->siteName,
                'participationUrl' => $this->stepUrlResolver->__invoke($mediator->getStep()),
                'projectName' => $this->getMediatorProjectName($mediator),
            ],
            $participant
        );
    }

    private function getBaseUrl(): string
    {
        return $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);
    }

    private function getMediatorProjectName(Mediator $mediator): string
    {
        return $mediator
            ->getStep()
            ->getProject()
            ->getTitle()
            ;
    }
}
