<?php

namespace Capco\AppBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\UserConnection;
use Symfony\Component\HttpFoundation\JsonResponse;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class PriorAuthenticationHandler
{
    private $userConnectionRepository;

    public const MAX_FAILED_LOGIN_ATTEMPT = 5;

    public function __construct(UserConnectionRepository $userConnectionRepository)
    {
        $this->userConnectionRepository = $userConnectionRepository;
    }

    public function onKernelRequest(GetResponseEvent $event): void
    {
        $request = $event->getRequest();

        if ('login_check' === $request->get('_route')) {
            /** 
             * @todo @Jpec57
             * We need a feature toggle "security_prevent_login_bruteforce"
             * when it's disabled we can skip verification in case of performance issues
             */
            $data = json_decode($request->getContent(), true);

            $email = $data['username'];
             if (!$email) {
                $event->setResponse(new JsonResponse(['reason' => 'Username must be provided.'], 401));
            }

            /** 
             * @todo @Jpec57
             * We need to check attempt by email and IP
             * Otherwise an attacker can force Alice or Bob to use a captcha.
             */
            $failedAttempts = $this->userConnectionRepository->countFailedAttemptByEmailInLastHour($email);
            
            if ($failedAttempts >= MAX_FAILED_LOGIN_ATTEMPT) {
                if (!isset($data['captcha'])) {
                   /**
                    * @todo @Jpec57
                    * Add $logger->warning with context here someone tried to use API to bruteforce an email
                    * Otherwise we don't know what happened
                    */
                    $event->setResponse(new JsonResponse(['reason' => 'You must provide a captcha to login.'], 401));
                }
                
                /**
                 * @todo @Jpec57
                 * Security issue !
                 * We do not check the captcha value !!! 
                 * So I can give a random string and continue my brute force
                 */
            }

        }
    }
}
