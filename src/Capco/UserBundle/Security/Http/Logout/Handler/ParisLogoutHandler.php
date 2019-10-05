<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\MonCompteParis\OpenAmClient;

class ParisLogoutHandler implements LogoutHandlerInterface
{
    private $toggleManager;
    private $client;

    public function __construct(Manager $toggleManager, OpenAmClient $client)
    {
        $this->toggleManager = $toggleManager;
        $this->client = $client;
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        if (
            $this->toggleManager->isActive('login_paris') &&
            $responseWithRequest->getRequest()->cookies->has(OpenAmClient::COOKIE_NAME)
        ) {
            $this->client->setCookie(
                $responseWithRequest->getRequest()->cookies->get(OpenAmClient::COOKIE_NAME)
            );
            $this->client->logoutUser();
            $responseWithRequest
                ->getResponse()
                ->headers->clearCookie(OpenAmClient::COOKIE_NAME, '/', OpenAmClient::COOKIE_DOMAIN);
        }

        return $responseWithRequest;
    }
}
