<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\UserBundle\Security\Http\Logout\Handler\LogoutHandlerInterface;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    /**
     * @var LogoutHandlerInterface[]
     */
    protected array $handlers;

    private TokenStorageInterface $tokenStorage;
    private RouterInterface $router;

    public function __construct(
        array $handlers,
        TokenStorageInterface $tokenStorage,
        RouterInterface $router
    ) {
        $this->handlers = $handlers;
        $this->tokenStorage = $tokenStorage;
        $this->router = $router;
    }

    public function onLogoutSuccess(Request $request)
    {
        $currentToken = $this->tokenStorage->getToken();
        $theToken = $request->getSession()->get('theToken');

        self::setOauthTokenFromSession($currentToken, $theToken);
        $responseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse($request->headers->get('referer'))
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
            $currentToken instanceof OAuthToken &&
            '.anon' !== $currentToken->getUser() &&
            null === $currentToken->getResourceOwnerName() &&
            $theToken
        ) {
            $data = unserialize($theToken);
            $currentToken->setResourceOwnerName($data[5]);
            $currentToken->setRawToken($data[1]);
        }

        return $currentToken;
    }
}
