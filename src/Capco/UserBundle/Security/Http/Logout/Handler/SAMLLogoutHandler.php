<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use SimpleSAML\Auth\Simple;
use SimpleSAML\Session;

class SAMLLogoutHandler implements LogoutHandlerInterface
{
    public function __construct(private readonly Manager $toggleManager, private ?Simple $samlClient = null)
    {
    }

    public function handle(
        RedirectResponseWithRequestInterface $responseWithRequest
    ): RedirectResponseWithRequestInterface {
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
