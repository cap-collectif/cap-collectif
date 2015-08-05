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
        ];
    }

    public function onPostOpinionVersion(ObjectEvent $event)
    {
        $version = $event->getObject();
        $opinion = $version->getParent();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $consultation = $step->getConsultationAbstractStep()->getConsultation();

        $event->getVisitor()->addData(
            '_links',
            [
                'show' => $this->router->generate('app_consultation_show_opinion_version', [
                        'consultationSlug' => $consultation->getSlug(),
                        'stepSlug' => $step->getSlug(),
                        'opinionTypeSlug' => $opinionType->getSlug(),
                        'opinionSlug' => $opinion->getSlug(),
                        'versionSlug' => $version->getSlug(),
                    ], true),
            ]
        );
    }
}
