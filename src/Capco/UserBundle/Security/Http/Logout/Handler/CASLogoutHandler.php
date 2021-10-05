<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Handler\CasHandler;

/**
 * Class CASLogoutHandler.
 */
class CASLogoutHandler implements LogoutHandlerInterface
{
    private Manager $toggleManager;

    private CasHandler $casHandler;

    public function __construct(Manager $toggleManager, CasHandler $casHandler)
    {
        $this->toggleManager = $toggleManager;
        $this->casHandler = $casHandler;
    }

    /**
     * @throws \Exception
     */
    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        if ($this->toggleManager->isActive('login_cas')) {
            $responseWithRequest
                ->getRequest()
                ->getSession()
                ->invalidate();

            $this->casHandler->logout($responseWithRequest->getResponse()->getTargetUrl());
        }

        return $responseWithRequest;
    }
}
