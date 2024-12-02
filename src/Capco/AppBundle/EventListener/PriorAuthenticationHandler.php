<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\UserConnectionRepository;
use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesser;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class PriorAuthenticationHandler
{
    final public const MAX_FAILED_LOGIN_ATTEMPT = 5;

    public function __construct(private readonly UserConnectionRepository $userConnectionRepository, private readonly Manager $toggleManager, private readonly LoggerInterface $logger, private readonly CaptchaChecker $captchaChecker)
    {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if ('login_check' === $request->get('_route')) {
            if ($this->toggleManager->isActive('restrict_connection')) {
                $data = json_decode($request->getContent(), true);

                $email = $data['username'];
                if (!$email) {
                    $event->setResponse(
                        new JsonResponse(['reason' => 'Username must be provided.'], 401)
                    );
                }

                $ip = RequestGuesser::getClientIpFromRequest($request);
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
                        $success = $this->captchaChecker->__invoke($data['captcha'], $ip);
                        if (!$success) {
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
