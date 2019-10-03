<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Psr\Log\LoggerInterface;
use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\JsonResponse;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class PriorAuthenticationHandler
{
    public const MAX_FAILED_LOGIN_ATTEMPT = 5;

    private $userConnectionRepository;
    private $toggleManager;
    private $logger;
    private $apiKey;

    public function __construct(
        UserConnectionRepository $userConnectionRepository,
        Manager $toggleManager,
        LoggerInterface $logger,
        $apiKey
    ) {
        $this->userConnectionRepository = $userConnectionRepository;
        $this->toggleManager = $toggleManager;
        $this->logger = $logger;
        $this->apiKey = $apiKey;
    }

    public function onKernelRequest(GetResponseEvent $event): void
    {
        if ($this->toggleManager->isActive('restrict_connection')) {
            $request = $event->getRequest();

            if ('login_check' === $request->get('_route')) {
                $data = json_decode($request->getContent(), true);

                $email = $data['username'];
                if (!$email) {
                    $event->setResponse(
                        new JsonResponse(['reason' => 'Username must be provided.'], 401)
                    );
                }

                $ip = $request->getClientIp();
                $failedAttempts = $this->userConnectionRepository->countFailedAttemptByEmailAndIPInLastHour(
                    $email,
                    $ip
                );

                if ($failedAttempts >= self::MAX_FAILED_LOGIN_ATTEMPT) {
                    if (!isset($data['captcha'])) {
                        $this->logger->warning(
                            'Someone is certainly trying to bruteforce an email',
                            ['email' => $email]
                        );

                        $event->setResponse(
                            new JsonResponse(
                                ['reason' => 'You must provide a captcha to login.'],
                                401
                            )
                        );
                    } else {
                        $recaptcha = new ReCaptcha($this->apiKey);
                        $resp = $recaptcha->verify($data['captcha'], $request->getClientIp());

                        if (!$resp->isSuccess()) {
                            $event->setResponse(
                                new JsonResponse(['reason' => 'Invalid captcha.'], 401)
                            );
                        }
                    }
                }
            }
        }
    }
}
