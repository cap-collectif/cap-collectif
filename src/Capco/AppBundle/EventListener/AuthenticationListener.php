<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\AuthenticationEvents;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Capco\AppBundle\Utils\RequestGuesser;

class AuthenticationListener implements EventSubscriberInterface
{
    private RequestGuesser $requestGuesser;
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em, RequestGuesser $requestGuesser)
    {
        $this->em = $em;
        $this->requestGuesser = $requestGuesser;
    }

    public function onAuthenticationFailure(AuthenticationFailureEvent $event): void
    {
        // Save an unsuccessfull user login.
        $data = $this->requestGuesser->getJsonContent();
        $email = $data['username'] ?? null;
        $userConnection = new UserConnection();
        $userConnection
            ->setSuccess(false)
            ->setEmail($email)
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setNavigator($this->requestGuesser->getUserAgent());
        $this->em->persist($userConnection);
        $this->em->flush();
    }

    public function onAuthenticationSuccess(InteractiveLoginEvent $event): void
    {
        $request = $event->getRequest();
        $session = $request->getSession();
        // Authentication
        $authenticationToken = $event->getAuthenticationToken();
        $serialized = $authenticationToken->serialize();
        $session->set('theToken', $serialized);

        // Save a successfull user login.
        $email = null;
        $data = $this->requestGuesser->getJsonContent();
        $user = $authenticationToken->getUser();
        $email = $data['username'] ?? '';
        $userConnection = new UserConnection();
        $userConnection
            ->setUser($user)
            ->setEmail($email)
            ->setSuccess(true)
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setNavigator($this->requestGuesser->getUserAgent());
        $this->em->persist($userConnection);
        $this->em->flush();
    }

    public static function getSubscribedEvents(): array
    {
        return [
            AuthenticationEvents::AUTHENTICATION_FAILURE => 'onAuthenticationFailure',
            AuthenticationEvents::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess',
        ];
    }
}
