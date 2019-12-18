<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\Controller\ConnectController;
use HWI\Bundle\OAuthBundle\Security\Core\Exception\AccountNotLinkedException;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * ConnectController.
 */
class OauthConnectController extends ConnectController
{
    protected $featuresForServices = [
        'facebook' => ['login_facebook'],
        'google' => ['login_gplus'],
        'twitter' => ['login_twitter'],
        'franceconnect' => ['login_franceconnect']
    ];

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

        // TODO We should try not redirect to homepage but previous page
        // https://github.com/cap-collectif/platform/issues/9585
        return new RedirectResponse($this->generateUrl('app_homepage'));
    }

    /**
     * Connects a user to a given account if the user is logged in and connect is enabled.
     *
     * @param Request $request The active request
     * @param string  $service Name of the resource owner to connect to
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     *
     * @return Response
     */
    public function connectServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->container
                ->get('translator')
                ->trans('error.feature_not_enabled', [], 'CapcoAppBundle');

            throw new NotFoundHttpException($message);
        }

        return parent::connectServiceAction($request, $service);
    }

    /**
     * @param string $service
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     *
     * @return RedirectResponse
     */
    public function redirectToServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->container
                ->get('translator')
                ->trans('error.feature_not_enabled', [], 'CapcoAppBundle');

            throw new NotFoundHttpException($message);
        }

        return parent::redirectToServiceAction($request, $service);
    }

    protected function serviceHasEnabledFeature(string $service): bool
    {
        $toggleManager = $this->container->get(Manager::class);

        if ('openid' === $service) {
            $oauth2Repository = $this->get(Oauth2SSOConfigurationRepository::class);

            return $oauth2Repository->findOneBy(['enabled' => true]) ? true : false;
        }

        return $toggleManager->hasOneActive($this->getFeaturesForService($service));
    }
}
