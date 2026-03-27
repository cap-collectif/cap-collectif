<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use Doctrine\ORM\EntityManagerInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpenIDLogoutHandler implements LogoutHandlerInterface
{
    public function __construct(
        private readonly ResourceOwnerInterface $resourceOwner,
        private readonly RouterInterface $router,
        private readonly OpenIDReferrerResolver $refererResolver,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly AbstractSSOConfigurationRepository $repository,
        private readonly EntityManagerInterface $em,
        private readonly string $instanceName
    ) {
    }

    public function handle(
        RedirectResponseWithRequestInterface $responseWithRequest
    ): RedirectResponseWithRequestInterface {
        $token = $this->tokenStorage->getToken();
        $user = $token?->getUser();
        $sessionId = $responseWithRequest
            ->getRequest()
            ->getSession()
            ->getId()
        ;
        if ($token instanceof OAuthToken && 'openid' === $token->getResourceOwnerName()) {
            $oauth2 = $this->repository->findOneByType('oauth2', true);

            if ($oauth2 instanceof Oauth2SSOConfiguration && $oauth2->isDisconnectSsoOnLogout()) {
                $logoutURL = $this->resourceOwner->getOption('logout_url');
                $homepageUrl = $this->router->generate(
                    'app_homepage',
                    [],
                    RouterInterface::ABSOLUTE_URL
                );

                if ($responseWithRequest->getRequest()->query->get('ssoSwitchUser')) {
                    $parameters = [
                        $this->refererResolver->getRefererParameterForLogout() => $homepageUrl . '/login/openid?_destination=' . $homepageUrl,
                    ];
                } else {
                    $postLogoutRedirectUri = $oauth2->getPostLogoutRedirectUri() ?: $homepageUrl;
                    $parameters = [
                        $this->refererResolver->getRefererParameterForLogout() => $postLogoutRedirectUri,
                    ];
                    if ($user instanceof User && $sessionId) {
                        $user->removeOpenIdSessionFromUserSession($sessionId);
                        $this->em->flush();
                    }
                }

                $parameters['client_id'] = $oauth2->getClientId();

                $idToken = $token->getRawToken()['id_token'] ?? null;
                if (str_contains($this->instanceName, 'occitanie') && $idToken) {
                    $parameters['id_token_hint'] = $idToken;
                }

                $session = $responseWithRequest->getRequest()->getSession();
                $sessionName = $session->getName();
                $session->remove('theToken');
                $session->invalidate();

                $response = new RedirectResponse(
                    $logoutURL . '?' . http_build_query($parameters, '', '&') ?? '/'
                );
                $response->headers->clearCookie($sessionName, '/');
                $response->headers->clearCookie('REMEMBERME', '/');

                $responseWithRequest->setResponse($response);
            }
        }

        return $responseWithRequest;
    }
}
