<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\Capco\UserBundle\OpenID\ReferrerResolver\KeycloakReferrerResolver;
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
    public function __construct(private readonly ResourceOwnerInterface $resourceOwner, private readonly RouterInterface $router, private readonly OpenIDReferrerResolver $refererResolver, private readonly TokenStorageInterface $tokenStorage, private readonly AbstractSSOConfigurationRepository $repository, private readonly EntityManagerInterface $em)
    {
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        $token = $this->tokenStorage->getToken();
        $user = $this->tokenStorage->getToken()->getUser();
        $sessionId = $responseWithRequest
            ->getRequest()
            ->getSession()
            ->getId()
        ;
        if ($token && $token instanceof OAuthToken && 'openid' === $token->getResourceOwnerName()) {
            $oauth2 = $this->repository->findASsoByType('oauth2');

            if ($oauth2 && $oauth2->isDisconnectSsoOnLogout()) {
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
                    $parameters = [
                        $this->refererResolver->getRefererParameterForLogout() => $homepageUrl,
                    ];
                    if ($user instanceof User && $sessionId) {
                        $user->removeOpenIdSessionFromUserSession($sessionId);
                        $this->em->flush();
                    }
                }

                if ($this->refererResolver->getRefererResolver() instanceof KeycloakReferrerResolver) {
                    $parameters['id_token_hint'] = $token->getRawToken()['id_token'];
                }

                $responseWithRequest->setResponse(
                    new RedirectResponse(
                        $logoutURL . '?' . http_build_query($parameters, '', '&') ?? '/'
                    )
                );
            }
        }

        return $responseWithRequest;
    }
}
