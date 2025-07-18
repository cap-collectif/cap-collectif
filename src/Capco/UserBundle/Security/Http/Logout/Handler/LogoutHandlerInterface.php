<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

interface LogoutHandlerInterface
{
    public function handle(
        RedirectResponseWithRequestInterface $responseWithRequest
    ): RedirectResponseWithRequestInterface;
}
