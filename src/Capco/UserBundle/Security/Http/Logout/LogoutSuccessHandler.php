<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\UserBundle\Security\Http\Logout\Handler\LogoutHandlerInterface;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    public function __construct(
        /**
         * @var LogoutHandlerInterface[]
         */
        protected array $handlers,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly RouterInterface $router,
        private readonly KernelInterface $kernel
    ) {
    }

    public function onLogoutSuccess(Request $request): RedirectResponse
    {
        $currentToken = $this->tokenStorage->getToken();
        $theToken = $request->getSession()->get('theToken');

        $url = $request->headers->get('referer') ?? $this->router->generate('app_homepage');
        if ('dev' === $this->kernel->getEnvironment() && str_contains((string) $request->headers->get('referer'), 'https://capco.dev/admin-next/')) {
            $url = $this->router->generate('app_homepage');
        }
        self::setOauthTokenFromSession($currentToken, $theToken);
        $responseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse($url)
        );

        foreach ($this->handlers as $handler) {
            $handler->handle($responseWithRequest);
        }

        return $responseWithRequest->getResponse();
    }

    public static function setOauthTokenFromSession(
        TokenInterface $currentToken,
        ?string $theToken
    ): TokenInterface {
        if (
            $currentToken instanceof OAuthToken
            && '.anon' !== $currentToken->getUser()
            && null === $currentToken->getResourceOwnerName()
            && $theToken
        ) {
            $data = unserialize($theToken);
            $currentToken->setResourceOwnerName($data[5]);
            $currentToken->setRawToken($data[1]);
        }

        return $currentToken;
    }
}
