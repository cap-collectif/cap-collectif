<?php

declare(strict_types=1);

namespace Capco\UserBundle\Controller;

use Capco\UserBundle\Authenticator\MagicLinkAuthenticator;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\Security\Http\SecurityEvents;

class MagicLinkController extends AbstractController
{
    public function __construct(private readonly MagicLinkAuthenticator $magicLinkAuthenticator, private readonly LoggerInterface $logger, private readonly TokenStorageInterface $tokenStorage, private readonly EventDispatcherInterface $eventDispatcher)
    {
    }

    /**
     * @Route("/magic-link/{token}", name="capco_magic_link", methods={"GET"}, options={"i18n" = false})
     */
    public function magicLinkAction(Request $request, string $token): Response
    {
        try {
            $securityToken = $this->magicLinkAuthenticator->authenticateToken($token);
            $redirectUrl = $this->magicLinkAuthenticator->getRedirectUrl($securityToken);
        } catch (\Throwable $th) {
            $this->logger->error($th->getMessage());

            return $this->redirectToRoute('app_homepage');
        }

        $this->tokenStorage->setToken($securityToken);
        $event = new InteractiveLoginEvent($request, $securityToken);
        $this->eventDispatcher->dispatch(SecurityEvents::INTERACTIVE_LOGIN, $event);

        return $redirectUrl ? $this->redirect($redirectUrl) : $this->redirectToRoute('app_homepage');
    }
}
