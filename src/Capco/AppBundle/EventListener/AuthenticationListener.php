<?php


namespace Capco\AppBundle\EventListener;


use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\AuthenticationEvents;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

class AuthenticationListener  implements EventSubscriberInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var RequestStack
     */
    protected $requestStack;


    public function __construct(EntityManagerInterface $entityManager, RequestStack $requestStack){
        $this->em = $entityManager;
        $this->requestStack = $requestStack;
    }

    public function onAuthenticationFailure( AuthenticationFailureEvent $event ): void
    {
        $email = null;
        $ipAddress = null;
        $request = $this->requestStack->getMasterRequest();
        if ($request !== null){
            $timestamp = new \DateTime();
            $data = json_decode($request->getContent(), true);
            $email = $data['username'] ?? '';

            $ipAddress = $request->getClientIp();
            $userConnection = new UserConnection();
            $userConnection
                ->setDatetime($timestamp)
                ->setEmail($email)
                ->setSuccess(false)
                ->setIpAddress($ipAddress);
            $this->em->persist($userConnection);
            $this->em->flush();

        }
    }

    public function onAuthenticationSuccess( InteractiveLoginEvent $event ): void
    {
        $request = $event->getRequest();
        $email = null;
        if ($request !== null){
            $data = json_decode($request->getContent(), true);
            $email = $data['username'] ?? '';
            $userConnection = new UserConnection();
            $userConnection
                ->setDatetime(new \DateTime())
                ->setEmail($email)
                ->setSuccess(true)
                ->setIpAddress($event->getRequest()->getClientIp());
            $this->em->persist($userConnection);
            $this->em->flush();
        }
    }


    public static function getSubscribedEvents(): array
    {
        return [
            AuthenticationEvents::AUTHENTICATION_FAILURE => 'onAuthenticationFailure',
            AuthenticationEvents::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess',
        ];
    }
}
