<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class PriorAuthenticationHandler
{
    private $repository;

    public const MAXIMUM_LOGIN_ATTEMPT = 5;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->repository = $entityManager->getRepository(UserConnection::class);
    }

    public function onKernelRequest(GetResponseEvent $event): void
    {
        $request = $event->getRequest();
        $event->setResponse(new JsonResponse(['reason' => $request->get('_route')], 401));

        if ('login_check' === $request->get('_route')) {
            if (!$event->isMasterRequest()) {
                return;
            }

            /** 
             * @todo @Jpec57
             * We need a feature toggle "security_prevent_login_bruteforce"
             * when it's disabled we can skip verification in case of performance issues
             */
            $data = json_decode($request->getContent(), true);

            /** 
             * @todo @Jpec57
             * If username is not provided we can throw an exception instead.
             */
            $email = $data['username'] ?? '';

            /** 
             * @todo @Jpec57
             * We need to check attempt by email and IP
             * Otherwise an attacker can force Alice or Bob to use a captcha.
             */
            $failedAttempts = $this->repository->countFailedAttemptByEmailInLastHour($email);
            
            /** 
              * @todo @Jpec57
              * Why are we using $data['displayCaptcha'] ?
              * This comes from the client and we should never trust our client.
              */
            if ($failedAttempts > self::MAXIMUM_LOGIN_ATTEMPT &&
                (!isset($data['displayCaptcha']) ||
                (false === $data['displayCaptcha']) ||
                ($data['displayCaptcha'] && !isset($data['captcha'])))
            ) {
                /** 
                 * @todo @Jpec57
                 * Add $logger->warning with context here someone tried to use API to bruteforce an email
                 * Otherwise we don't know what happened
                 */
                $event->setResponse(new JsonResponse(['reason' => 'You have to wait'], 401));
            }
        }
    }
}
