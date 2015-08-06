<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionSerializationListener implements EventSubscriberInterface
{
    private $router;
    private $tokenStorage;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\OpinionVersion',
                'method' => 'onPostOpinionVersion',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Opinion',
                'method' => 'onPostOpinion',
            ],
        ];
    }

    public function onPostOpinionVersion(ObjectEvent $event)
    {
        $version = $event->getObject();
        $opinion = $version->getParent();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $consultation = $step->getConsultationAbstractStep()->getConsultation();
        $user = $this->tokenStorage->getToken()->getUser();

        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->router->generate('app_consultation_show_opinion_version', [
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $version->getSlug(),
                ], true),
                'report' => $this->router->generate('app_report_opinion_version', [
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $version->getSlug(),
                ], true),
            ]
        );

        $event->getVisitor()->addData(
            'user_vote', $user === "anon." ? null : $version->getVoteValueByUser($user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === "anon." ? false : $version->userHasReport($user)
        );

    }

    public function onPostOpinion(ObjectEvent $event)
    {
        $opinion = $event->getObject();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $consultation = $step->getConsultationAbstractStep()->getConsultation();
        $user = $this->tokenStorage->getToken()->getUser();

        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->router->generate('app_consultation_show_opinion', [
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                ], true),
                'report' => $this->router->generate('app_report_opinion', [
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                ], true),
            ]
        );

        // $event->getVisitor()->addData(
        //     'user_vote', $user === "anon." ? null : $version->getVoteValueByUser($user)
        // );

        // $event->getVisitor()->addData(
        //     'has_user_reported', $user === "anon." ? false : $version->userHasReport($user)
        // );

    }

}
