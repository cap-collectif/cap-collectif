<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

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
    private ResourceOwnerInterface $resourceOwner;
    private RouterInterface $router;
    private OpenIDReferrerResolver $refererResolver;
    private AbstractSSOConfigurationRepository $repository;
    private TokenStorageInterface $tokenStorage;
    private EntityManagerInterface $em;

    public function __construct(
        ResourceOwnerInterface $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        AbstractSSOConfigurationRepository $repository,
        EntityManagerInterface $em
    ) {
        $this->resourceOwner = $resourceOwner;
        $this->router = $router;
        $this->refererResolver = $referrerResolver;
        $this->repository = $repository;
        $this->tokenStorage = $tokenStorage;
        $this->em = $em;
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
