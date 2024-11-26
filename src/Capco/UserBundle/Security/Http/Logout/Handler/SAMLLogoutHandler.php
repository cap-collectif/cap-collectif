<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use SimpleSAML\Auth\Simple;
use SimpleSAML\Session;

class SAMLLogoutHandler implements LogoutHandlerInterface
{
    private readonly Manager $toggleManager;
    private readonly ?Simple $samlClient;

    public function __construct(Manager $toggleManager, ?Simple $samlClient = null)
    {
        $this->toggleManager = $toggleManager;
        $this->samlClient = $samlClient;
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        if ($this->samlClient && $this->toggleManager->isActive('login_saml')) {
            $responseWithRequest
                ->getRequest()
                ->getSession()
                ->invalidate()
            ;

            $this->samlClient->logout($responseWithRequest->getResponse()->getTargetUrl());

            Session::getSessionFromRequest()->cleanup();
        }

        return $responseWithRequest;
    }
}
