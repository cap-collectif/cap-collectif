<?php

namespace Capco\AppBundle\Toggle;

use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class RequestListener
{
    protected $manager;
    protected $translator;
    protected $siteParameterResolver;
    protected $shieldLogin;
    protected $shieldPwd;

    public function __construct(Manager $manager, TranslatorInterface $translator, Resolver $siteParameterResolver, $shieldLogin = null, $shieldPwd = null)
    {
        $this->manager = $manager;
        $this->translator = $translator;
        $this->siteParameterResolver = $siteParameterResolver;
        $this->shieldLogin = $shieldLogin;
        $this->shieldPwd = $shieldPwd;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();

        // When requesting the API, we don't use shield mode to prevent conflicts with JWT Token
        if (false === strpos($request->getRequestUri(), '/api/')) {

            // Shield mode activated
            if ($this->manager->isActive('shield_mode')) {
                $header = $request->headers->get('Authorization');

                // Normal authentication
                $username = $this->siteParameterResolver->getValue('security.shield_mode.username');
                if (null == $username) {
                    $username = 'admin';
                }
                $pwd = $this->siteParameterResolver->getValue('security.shield_mode.password');
                $authString = base64_encode($username.':'.$pwd);

                // Maintenance authentication
                $maintenanceAuthString = null;
                if ($this->shieldLogin != null && $this->shieldLogin != '' && $this->shieldPwd != null && $this->shieldPwd != '') {
                    $maintenanceAuthString = base64_encode($this->shieldLogin.':'.$this->shieldPwd);
                }

                if (false === strpos($header, $authString) && null != $maintenanceAuthString && false === strpos(
                        $header,
                        $maintenanceAuthString
                    )
                ) {
                    $event->setResponse(new Response('Access restricted'));
                    $event->getResponse()->headers->set('WWW-Authenticate', 'Basic realm="Member Area"');
                    $event->getResponse()->setStatusCode('401');
                }
            }
        }

        // Disabled feature flag on requested url
        $flagsAttributes = $request->attributes->get('_feature_flags');
        $flags = $flagsAttributes ? explode(',', $flagsAttributes) : [];

        foreach ($flags as $flag) {
            if (null !== $flag && !$this->manager->isActive($flag)) {
                $message = $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle');
                throw new NotFoundHttpException($message);
            }
        }
    }
}
