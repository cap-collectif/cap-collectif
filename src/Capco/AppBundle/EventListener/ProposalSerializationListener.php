<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalSerializationListener implements EventSubscriberInterface
{
    private $router;
    private $tokenStorage;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage)
    {
        if (getenv('SYMFONY_USE_SSL')) {
            $router->getContext()->setScheme('https');
        }

        $this->router       = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event'  => 'serializer.post_serialize',
                'class'  => 'Capco\AppBundle\Entity\Proposal',
                'method' => 'onPostProposal',
            ],
        ];
    }

    public function onPostProposal(ObjectEvent $event)
    {
        $proposal = $event->getObject();
        $step     = $proposal->getStep();
        $project  = $step->getProjectAbstractStep()->getProject();
        $user     = $this->tokenStorage->getToken()->getUser();

        $showUrl = $this->router->generate('app_project_show_proposal', [
            'proposalSlug' => $proposal->getSlug(),
            'projectSlug'  => $project->getSlug(),
            'stepSlug'     => $step->getSlug()
        ], true);

        $event->getVisitor()->addData(
            '_links', [
                'show' => $showUrl,
            ]
        );

        $event->getVisitor()->addData(
            'votes_count', $user === 'anon.' ? 0 : $proposal->getVoteCountOk()
        );

    }
}
