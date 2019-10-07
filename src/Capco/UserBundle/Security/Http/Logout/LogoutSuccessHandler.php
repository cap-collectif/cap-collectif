<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\UserBundle\Security\Http\Logout\Handler\LogoutHandlerInterface;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    /**
     * @var LogoutHandlerInterface[]
     */
    protected $handlers;

    public function __construct(array $handlers)
    {
        $this->handlers = $handlers;
    }

    public function onLogoutSuccess(Request $request)
    {
        $responseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse($request->getSchemeAndHttpHost())
        );

        foreach ($this->handlers as $handler) {
            $handler->handle($responseWithRequest);
        }

        return $responseWithRequest->getResponse();
    }
}
