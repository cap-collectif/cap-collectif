<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Repository\FacebookSSOConfigurationRepository;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\Controller\ConnectController;
use HWI\Bundle\OAuthBundle\Security\Core\Exception\AccountNotLinkedException;
use HWI\Bundle\OAuthBundle\Security\OAuthUtils;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Contracts\Translation\TranslatorInterface;

class OauthConnectController extends ConnectController
{
    protected $featuresForServices = [
        'twitter' => ['login_twitter'],
        'franceconnect' => ['login_franceconnect'],
    ];

    protected HttpUtils $httpUtils;
    protected OAuthUtils $authUtils;
    protected Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository;
    protected FacebookSSOConfigurationRepository $facebookSSOConfigurationRepository;
    protected Manager $manager;
    protected TranslatorInterface $translator;
    protected LoggerInterface $logger;

    public function __construct(
        HttpUtils $httpUtils,
        OAuthUtils $authUtils,
        Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository,
        FacebookSSOConfigurationRepository $facebookSSOConfigurationRepository,
        Manager $manager,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->httpUtils = $httpUtils;
        $this->authUtils = $authUtils;
        $this->oauth2SSOConfigurationRepository = $oauth2SSOConfigurationRepository;
        $this->facebookSSOConfigurationRepository = $facebookSSOConfigurationRepository;
        $this->manager = $manager;
        $this->translator = $translator;
        $this->logger = $logger;
    }

    public function getFeaturesForService($service): array
    {
        return $this->featuresForServices[$service];
    }

    /**
     * Action that handles the login 'form'. If connecting is enabled the
     * user will be redirected to the appropriate login urls or registration forms.
     *
     *
     * @return Response
     */
    public function connectAction(Request $request)
    {
        $connect = $this->container->getParameter('hwi_oauth.connect');
        $hasUser = $this->getUser()
            ? $this->isGranted($this->container->getParameter('hwi_oauth.grant_rule'))
            : false;

        $error = $this->getErrorForRequest($request);

        // if connecting is enabled and there is no user, redirect to the registration form
        if ($connect && !$hasUser && $error instanceof AccountNotLinkedException) {
            $key = time();
            $session = $request->getSession();
            if (!$session->isStarted()) {
                $session->start();
            }

            $session->set('_hwi_oauth.registration_error.' . $key, $error);

            return $this->redirectToRoute('hwi_oauth_connect_registration', ['key' => $key]);
        }

        if ($error) {
            $this->logger->error('Oauth authentication error', ['error' => $error->getMessage()]);
        }

        return new RedirectResponse($this->generateUrl('app_homepage'));
    }

    /**
     * Connects a user to a given account if the user is logged in and connect is enabled.
     *
     * @param Request $request The active request
     * @param string  $service Name of the resource owner to connect to
     *
     * @return Response
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     */
    public function connectServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle');

            throw new NotFoundHttpException($message);
        }

        return parent::connectServiceAction($request, $service);
    }

    /**
     * @param string $service
     *
     * @return RedirectResponse
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     */
    public function redirectToServiceAction(Request $request, $service)
    {
        if (!$this->container->get('session')->isStarted()) {
            $this->container->get('session')->start();
        }

        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle');

            throw new NotFoundHttpException($message);
        }

        if (
            $this->container->getParameter('hwi_oauth.connect') &&
            $this->isGranted($this->container->getParameter('hwi_oauth.grant_rule'))
        ) {
            return $this->associateToService($request, $service);
        }

        return parent::redirectToServiceAction($request, $service);
    }

    protected function serviceHasEnabledFeature(string $service): bool
    {
        if ('openid' === $service) {
            return (bool) $this->oauth2SSOConfigurationRepository->findOneBy(['enabled' => true]);
        }

        if ('facebook' === $service) {
            return (bool) $this->facebookSSOConfigurationRepository->findOneBy(['enabled' => true]);
        }

        return $this->manager->hasOneActive($this->getFeaturesForService($service));
    }

    private function associateToService(Request $request, $service): RedirectResponse
    {
        try {
            $redirectUrl = $this->httpUtils->generateUri(
                $request,
                $this->authUtils->getResourceOwnerCheckPath($service)
            );
            $resourceOwner = $this->authUtils->getResourceOwner($service);

            $authorizationUrl = $resourceOwner->getAuthorizationUrl($redirectUrl, []);
        } catch (\RuntimeException $e) {
            throw new NotFoundHttpException($e->getMessage(), $e);
        }

        $session = $request->getSession();

        // Check for a return path and store it before redirect
        if (null !== $session) {
            // initialize the session for preventing SessionUnavailableException
            if (!$session->isStarted()) {
                $session->start();
            }

            foreach ($this->container->getParameter('hwi_oauth.firewall_names') as $providerKey) {
                $sessionKey = '_security.' . $providerKey . '.target_path';
                $sessionKeyFailure = '_security.' . $providerKey . '.failed_target_path';

                $param = $this->container->getParameter('hwi_oauth.target_path_parameter');
                if (!empty($param) && ($targetUrl = $request->get($param))) {
                    $session->set($sessionKey, $targetUrl);
                }

                if (
                    $this->container->getParameter('hwi_oauth.failed_use_referer') &&
                    !$session->has($sessionKeyFailure) &&
                    ($targetUrl = $request->headers->get('Referer')) &&
                    $targetUrl !== $authorizationUrl
                ) {
                    $session->set($sessionKeyFailure, $targetUrl);
                }

                if (
                    $this->container->getParameter('hwi_oauth.use_referer') &&
                    !$session->has($sessionKey) &&
                    ($targetUrl = $request->headers->get('Referer')) &&
                    $targetUrl !== $authorizationUrl
                ) {
                    $session->set($sessionKey, $targetUrl);
                }
            }
        }

        return $this->redirect($authorizationUrl);
    }
}
