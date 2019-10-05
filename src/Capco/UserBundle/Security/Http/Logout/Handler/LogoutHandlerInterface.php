<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

interface LogoutHandlerInterface
{
    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest;
}
