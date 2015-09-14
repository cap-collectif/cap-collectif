<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ArgumentSerializationListener implements EventSubscriberInterface
{
    private $router;
    private $tokenStorage;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage)
    {
        if (getenv('SYMFONY_USE_SSL')) {
            $router->getContext()->setScheme('https');
        }

        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Argument',
                'method' => 'onPostArgument',
            ],
        ];
    }

    public function onPostArgument(ObjectEvent $event)
    {
        $argument = $event->getObject();
        $opinion = $argument->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $consultation = $step->getConsultationAbstractStep()->getConsultation();
        $user = $this->tokenStorage->getToken()->getUser();

        $event->getVisitor()->addData(
            '_links', [
                'edit' => $this->router->generate('app_consultation_edit_argument', [
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'argumentId' => $argument->getId(),
                ], true),
                'report' => $this->router->generate('app_report_argument', [
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'argumentId' => $argument->getId(),
                ], true),
            ]
        );

        $event->getVisitor()->addData(
            'has_user_voted', $user === 'anon.' ? false : $argument->userHasVote($user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === 'anon.' ? false : $argument->userHasReport($user)
        );
    }
}
