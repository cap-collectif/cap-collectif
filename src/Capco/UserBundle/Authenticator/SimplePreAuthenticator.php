<?php

namespace Capco\UserBundle\Authenticator;

namespace Capco\UserBundle\Authenticator;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Security\Core\User\CasUserProvider;
use Capco\UserBundle\Security\Core\User\SamlUserProvider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;
use Symfony\Component\Security\Guard\AuthenticatorInterface;

class SimplePreAuthenticator extends AbstractGuardAuthenticator
{
    protected Manager $toggleManager;
    protected ?SamlAuthenticator $samlAuthenticator;
    protected ?CasAuthenticator $casAuthenticator;
    private readonly ?CASSSOConfiguration $casConfiguration;
    private readonly ?AuthenticatorInterface $currentAuthenticator;
    private readonly ?UserProviderInterface $currentProvider;
    private readonly ?SamlUserProvider $samlUserProvider;
    private readonly ?CasUserProvider $casUserProvider;

    public function __construct(
        Manager $toggleManager,
        CASSSOConfigurationRepository $CASSSOConfigurationRepository,
        ?SamlAuthenticator $samlAuthenticator = null,
        ?CasAuthenticator $casAuthenticator = null,
        ?SamlUserProvider $samlUserProvider = null,
        ?CasUserProvider $casUserProvider = null
    ) {
        $this->toggleManager = $toggleManager;
        $this->casConfiguration = $CASSSOConfigurationRepository->findOneBy([]);
        $this->samlAuthenticator = $samlAuthenticator;
        $this->casAuthenticator = $casAuthenticator;
        $this->samlUserProvider = $samlUserProvider;
        $this->casUserProvider = $casUserProvider;

        $authenticatorAndProvider = $this->getCurrentAuthenticatorAndProvider();

        $this->currentAuthenticator = $authenticatorAndProvider['authenticator'] ?? null;
        $this->currentProvider = $authenticatorAndProvider['provider'] ?? null;
    }

    public function supports(Request $request): bool
    {
        if (!$this->currentAuthenticator || !$this->currentProvider) {
            return false;
        }

        return $this->currentAuthenticator->supports($request);
    }

    public function getCredentials(Request $request)
    {
        return $this->currentAuthenticator->getCredentials($request);
    }

    public function getUser($credentials, UserProviderInterface $userProvider): ?UserInterface
    {
        return $this->currentAuthenticator->getUser($credentials, $this->currentProvider);
    }

    public function checkCredentials($credentials, UserInterface $user): bool
    {
        return $this->currentAuthenticator->checkCredentials($credentials, $user);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return $this->currentAuthenticator->onAuthenticationFailure($request, $exception);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey): ?Response
    {
        return $this->currentAuthenticator->onAuthenticationSuccess($request, $token, $providerKey);
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return $this->currentAuthenticator->start($request, $authException);
    }

    public function supportsRememberMe(): bool
    {
        return $this->currentAuthenticator->supportsRememberMe();
    }

    /**
     * @return null|array{authenticator: ?AuthenticatorInterface, provider: ?UserProviderInterface}
     */
    private function getCurrentAuthenticatorAndProvider(): ?array
    {
        if ($this->toggleManager->isActive('login_saml')) {
            return [
                'authenticator' => $this->samlAuthenticator,
                'provider' => $this->samlUserProvider,
            ];
        }
        if (
            $this->casConfiguration
            && $this->toggleManager->isActive('login_cas')
            && $this->casConfiguration->isEnabled()
        ) {
            return [
                'authenticator' => $this->casAuthenticator,
                'provider' => $this->casUserProvider,
            ];
        }

        return null;
    }
}
