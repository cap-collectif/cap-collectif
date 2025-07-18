<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

interface RedirectResponseWithRequestInterface
{
    public function getRequest(): Request;

    public function getResponse(): RedirectResponse;

    public function setRequest(Request $request): void;

    public function setResponse(RedirectResponse $response): void;
}
