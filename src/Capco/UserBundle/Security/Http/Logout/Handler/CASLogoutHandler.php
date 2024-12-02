<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Handler\CasHandler;

/**
 * Class CASLogoutHandler.
 */
class CASLogoutHandler implements LogoutHandlerInterface
{
    private readonly ?CASSSOConfiguration $configuration;

    public function __construct(
        private readonly Manager $toggleManager,
        CASSSOConfigurationRepository $repository,
        private readonly CasHandler $casHandler
    ) {
        $this->configuration = $repository->findOneBy([]);
    }

    /**
     * @throws \Exception
     */
    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        if (
            $this->toggleManager->isActive('login_cas')
            && $this->configuration
            && $this->configuration->isEnabled()
        ) {
            $responseWithRequest
                ->getRequest()
                ->getSession()
                ->invalidate()
            ;

            $this->casHandler->logout($responseWithRequest->getResponse()->getTargetUrl());
        }

        return $responseWithRequest;
    }
}
