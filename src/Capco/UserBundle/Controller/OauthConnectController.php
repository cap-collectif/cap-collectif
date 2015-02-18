<?php

namespace Capco\UserBundle\Controller;

use HWI\Bundle\OAuthBundle\Controller\ConnectController;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use HWI\Bundle\OAuthBundle\Security\Core\Exception\AccountNotLinkedException;
use Symfony\Component\DependencyInjection\ContainerAware;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Security\Core\SecurityContext;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\Security\Http\SecurityEvents;

/**
 * ConnectController
 */
class OauthConnectController extends ConnectController
{
    protected $featuresForServices = array(
        'facebook' => array('login_facebook'),
        'google' => array('login_gplus')
    );

    public function getFeaturesForService($service)
    {
        return $this->featuresForServices[$service];
    }

    protected function serviceHasEnabledFeature($service)
    {
        $toggleManager = $this->container->get('capco.toggle.manager');
        return $toggleManager->hasOneActive($this->getFeaturesForService($service));
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
        $hasUser = $this->container->get('security.context')->isGranted('IS_AUTHENTICATED_REMEMBERED');

        $error = $this->getErrorForRequest($request);

        // if connecting is enabled and there is no user, redirect to the registration form
        if ($connect
            && !$hasUser
            && $error instanceof AccountNotLinkedException
        ) {
            $key = time();
            $session = $request->getSession();
            $session->set('_hwi_oauth.registration_error.'.$key, $error);

            return new RedirectResponse($this->generate('hwi_oauth_connect_registration', array('key' => $key)));
        }

        if ($error) {
            // TODO: this is a potential security risk (see http://trac.symfony-project.org/ticket/9523)
            $error = $error->getMessage();
        }

        return new RedirectResponse($this->generate('fos_user_security_login'));
    }

    /**
     * Connects a user to a given account if the user is logged in and connect is enabled.
     *
     * @param Request $request The active request.
     * @param string  $service Name of the resource owner to connect to.
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     */
    public function connectServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->container->get('translator')->trans('error.feature_not_enabled', array(), 'CapcoAppBundle');
            throw new NotFoundHttpException($message);
        }

        return parent::connectServiceAction($request, $service);
    }

    /**
     * @param Request $request
     * @param string  $service
     *
     * @throws NotFoundHttpException if features associated to web service are not enabled
     */
    public function redirectToServiceAction(Request $request, $service)
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->container->get('translator')->trans('error.feature_not_enabled', array(), 'CapcoAppBundle');
            throw new NotFoundHttpException($message);
        }

        return parent::redirectToServiceAction($request, $service);
    }
}
