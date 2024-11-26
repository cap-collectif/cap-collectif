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
    private readonly Manager $toggleManager;
    private readonly ?CASSSOConfiguration $configuration;
    private readonly CasHandler $casHandler;

    public function __construct(
        Manager $toggleManager,
        CASSSOConfigurationRepository $repository,
        CasHandler $casHandler
    ) {
        $this->toggleManager = $toggleManager;
        $this->configuration = $repository->findOneBy([]);
        $this->casHandler = $casHandler;
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
