<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use SimpleSAML\Auth\Simple;

class SAMLLogoutHandler implements LogoutHandlerInterface
{
    private $toggleManager;
    private $samlClient;

    public function __construct(Manager $toggleManager, ?Simple $samlClient = null)
    {
        $this->toggleManager = $toggleManager;
        $this->samlClient = $samlClient;
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        if ($this->samlClient && $this->toggleManager->isActive('login_saml')) {
            $this->samlClient->logout($responseWithRequest->getResponse()->getTargetUrl());
        }

        return $responseWithRequest;
    }
}
