<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class PriorAuthenticationHandler
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager->getRepository(UserConnection::class);
    }

    public function onKernelRequest(GetResponseEvent $event): void
    {
        $request = $event->getRequest();
        if ('/login_check' === $request->getPathInfo()) {
            if (!$event->isMasterRequest()) {
                return;
            }
            $data = json_decode($request->getContent(), true);

            $email = $data['username'] ?? '';
            $failedAttempts = $this->em->countAttemptByEmailInLastHour($email, false);
            if ($failedAttempts > 5 &&
                (!isset($data['displayCaptcha']) ||
                (false === $data['displayCaptcha']) ||
                ($data['displayCaptcha'] && !isset($data['captcha'])))
            ) {
                $event->setResponse(new JsonResponse(['reason' => 'You have to wait'], 401));
            }
        }
    }
}
