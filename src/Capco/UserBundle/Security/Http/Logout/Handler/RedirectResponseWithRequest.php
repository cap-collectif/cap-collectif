<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

final class RedirectResponseWithRequest implements RedirectResponseWithRequestInterface
{
    public function __construct(private Request $request, private RedirectResponse $response)
    {
    }

    public function getRequest(): Request
    {
        return $this->request;
    }

    public function getResponse(): RedirectResponse
    {
        return $this->response;
    }

    public function setRequest(Request $request): void
    {
        $this->request = $request;
    }

    public function setResponse(RedirectResponse $response): void
    {
        $this->response = $response;
    }
}
