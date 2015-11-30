<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class SourceSerializationListener implements EventSubscriberInterface
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
                'event'  => 'serializer.post_serialize',
                'class'  => 'Capco\AppBundle\Entity\Source',
                'method' => 'onPostSource',
            ],
        ];
    }

    public function onPostSource(ObjectEvent $event)
    {
        $source = $event->getObject();
        $opinion = $source->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $project = $step->getProjectAbstractStep()->getProject();
        $user = $this->tokenStorage->getToken()->getUser();

        $event->getVisitor()->addData(
            '_links', [
                'edit'                => $this->router->generate('app_edit_source', [
                    'projectSlug'     => $project->getSlug(),
                    'stepSlug'        => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug'     => $opinion->getSlug(),
                    'sourceSlug'      => $source->getSlug(),
                ], true),
                'report'              => $this->router->generate('app_report_source', [
                    'projectSlug'     => $project->getSlug(),
                    'stepSlug'        => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug'     => $opinion->getSlug(),
                    'sourceSlug'      => $source->getSlug(),
                ], true),
            ]
        );

        $event->getVisitor()->addData(
            'has_user_voted', $user === 'anon.' ? false : $source->userHasVote($user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === 'anon.' ? false : $source->userHasReport($user)
        );
    }
}
