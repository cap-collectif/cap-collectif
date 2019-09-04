<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\AuthenticationEvents;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

class AuthenticationListener implements EventSubscriberInterface
{
    /**
     * @var RequestStack
     */
    protected $requestStack;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    public function __construct(EntityManagerInterface $entityManager, RequestStack $requestStack)
    {
        $this->em = $entityManager;
        $this->requestStack = $requestStack;
    }

    public function onAuthenticationFailure(AuthenticationFailureEvent $event): void
    {
        $email = null;
        $ipAddress = null;
        $request = $this->requestStack->getMasterRequest();
        if (null !== $request) {
            $timestamp = new \DateTime();
            $data = json_decode($request->getContent(), true);
            $email = $data['username'] ?? null;
            $headers = $request->headers;
            $ipAddress = $request->getClientIp();
            $userConnection = new UserConnection();
            $userConnection
                ->setSuccess(false)
                ->setDatetime($timestamp)
                ->setEmail($email)
                ->setNavigator($headers->get('user-agent'))
                ->setIpAddress($ipAddress);
            $this->em->persist($userConnection);
            $this->em->flush();
        }
    }

    public function onAuthenticationSuccess(InteractiveLoginEvent $event): void
    {
        $request = $event->getRequest();
        $email = null;
        if (null !== $request) {
            $data = json_decode($request->getContent(), true);
            $user = $event->getAuthenticationToken()->getUser();
            $email = $data['username'] ?? '';
            $userConnection = new UserConnection();
            $headers = $request->headers;
            $userConnection
                ->setUser($user)
                ->setDatetime(new \DateTime())
                ->setEmail($email)
                ->setSuccess(true)
                ->setNavigator($headers->get('user-agent'))
                ->setIpAddress($event->getRequest()->getClientIp());
            $this->em->persist($userConnection);
            $this->em->flush();
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            AuthenticationEvents::AUTHENTICATION_FAILURE => 'onAuthenticationFailure',
            AuthenticationEvents::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess'
        ];
    }
}
