<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\Service\OpenIDBackchannel;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\AuthenticationEvents;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

class AuthenticationListener implements EventSubscriberInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly RequestGuesserInterface $requestGuesser,
        private readonly OpenIDBackchannel $openIDBackchannel,
        private readonly LoggerInterface $logger
    ) {
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
            ->setNavigator($this->requestGuesser->getUserAgent())
        ;
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
        $data = $this->requestGuesser->getJsonContent();
        $user = $authenticationToken->getUser();
        $email = $data['username'] ?? '';
        $userConnection = new UserConnection();
        $userConnection
            ->setUser($user)
            ->setEmail($email)
            ->setSuccess(true)
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setNavigator($this->requestGuesser->getUserAgent())
        ;

        if ($user instanceof User && $request->query->get('session_state')) {
            $this->setUserOpenIdSID($request, $user);
        }
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

    private function setUserOpenIdSID(Request $request, User $user): void
    {
        $sessionId = $request->getSession()->getId();
        $openIdSid = $request->query->get('session_state');
        if (empty($openIdSid)) {
            $this->logger->error(__METHOD__ . ' : openId SID is required  - ' . var_export($openIdSid, true));

            throw new \RuntimeException('openId SID is required');
        }

        if ($user->hasOpenIdSession($openIdSid)) {
            $this->openIDBackchannel->processToDeleteUserRedisSession($user, $openIdSid, false);
        }
        $user->addOpenIdSessionId($openIdSid, $sessionId);
    }
}
