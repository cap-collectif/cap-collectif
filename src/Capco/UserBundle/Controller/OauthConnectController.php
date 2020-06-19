<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\Controller\ConnectController;
use HWI\Bundle\OAuthBundle\Security\Core\Exception\AccountNotLinkedException;
use HWI\Bundle\OAuthBundle\Security\Http\ResourceOwnerMapLocator;
use HWI\Bundle\OAuthBundle\Security\OAuthUtils;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * ConnectController.
 */
class OauthConnectController extends ConnectController
{
    protected $featuresForServices = [
        'facebook' => ['login_facebook'],
        'google' => ['login_gplus'],
        'twitter' => ['login_twitter'],
        'franceconnect' => ['login_franceconnect'],
    ];

    private TranslatorInterface $translator;
    private Manager $toggleManager;
    private Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository;

    public function __construct(
        OAuthUtils $oauthUtils,
        ResourceOwnerMapLocator $resourceOwnerMapLocator,
        TranslatorInterface $translator,
        Manager $toggleManager,
        Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository
    ) {
        $this->translator = $translator;
        $this->toggleManager = $toggleManager;
        $this->oauth2SSOConfigurationRepository = $oauth2SSOConfigurationRepository;

        parent::__construct($oauthUtils, $resourceOwnerMapLocator);
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
            $logger = $this->get('logger');
            $logger->error('Oauth authentication error', ['error' => $error->getMessage()]);
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

    protected function serviceHasEnabledFeature(string $service): bool
    {
        if ('openid' === $service) {
            return $this->oauth2SSOConfigurationRepository->findOneBy(['enabled' => true])
                ? true
                : false;
        }

        return $this->toggleManager->hasOneActive($this->getFeaturesForService($service));
    }
}
