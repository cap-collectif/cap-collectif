<?php

namespace Capco\UserBundle\Controller;

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
        'openid' => ['login_openid'],
    ];

    public function getFeaturesForService($service)
    {
        return $this->featuresForServices[$service];
    }

    /**
     * Action that handles the login 'form'. If connecting is enabled the
     * user will be redirected to the appropriate login urls or registration forms.
     *
     * @param Request $request
     *
     * @return Response
     */
    public function connectAction(Request $request)
    {
        $connect = $this->container->getParameter('hwi_oauth.connect');
        $hasUser = $this->container->get('security.token_storage')
            ->getToken()
            ->getUser();
        $hasUser = is_object($user) ? $user->isGranted('IS_AUTHENTICATED_REMEMBERED') : false;

        $error = $this->getErrorForRequest($request);

        // if connecting is enabled and there is no user, redirect to the registration form
        if ($connect && !$hasUser && $error instanceof AccountNotLinkedException) {
            $key = time();
            $session = $request->getSession();
            $session->set('_hwi_oauth.registration_error.' . $key, $error);

            return new RedirectResponse(
                $this->generateUrl('hwi_oauth_connect_registration', ['key' => $key])
            );
        }

        if ($error) {
            // TODO: this is a potential security risk (see http://trac.symfony-project.org/ticket/9523)
            $error = $error->getMessage();
        }

        return new RedirectResponse($this->generateUrl('app_homepage'));
    }

    /**
     * Connects a user to a given account if the user is logged in and connect is enabled.
     *
     * @param Request $request The active request
     * @param string $service Name of the resource owner to connect to
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     *
     * @return Response
     */
    public function connectServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->container->get('translator')->trans(
                'error.feature_not_enabled',
                [],
                'CapcoAppBundle'
            );
            throw new NotFoundHttpException($message);
        }

        return parent::connectServiceAction($request, $service);
    }

    /**
     * @param Request $request
     * @param string $service
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     *
     * @return RedirectResponse
     */
    public function redirectToServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->container->get('translator')->trans(
                'error.feature_not_enabled',
                [],
                'CapcoAppBundle'
            );
            throw new NotFoundHttpException($message);
        }

        return parent::redirectToServiceAction($request, $service);
    }

    protected function serviceHasEnabledFeature($service)
    {
        $toggleManager = $this->container->get(Manager::class);

        return $toggleManager->hasOneActive($this->getFeaturesForService($service));
    }
}
