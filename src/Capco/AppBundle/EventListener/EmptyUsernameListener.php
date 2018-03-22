<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class EmptyUsernameListener
{
    protected $manager;
    protected $tokenStorage;
    protected $templating;

    public function __construct(Manager $manager, $tokenStorage, $templating)
    {
        $this->manager = $manager;
        $this->tokenStorage = $tokenStorage;
        $this->templating = $templating;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        $token = $this->tokenStorage->getToken();
        if ($token && $token->getUser() instanceof UserInterface && $token->getUser()->getUsername()) {
            return;
        }

        $response = new Response(
          $this->templating->render('CapcoAppBundle:Default:choose_a_username.html.twig')
        );
        $event->setResponse($response);
    }
}
