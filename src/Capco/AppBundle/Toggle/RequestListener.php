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

    public function __construct(Manager $manager, TranslatorInterface $translator, Resolver $siteParameterResolver)
    {
        $this->manager = $manager;
        $this->translator = $translator;
        $this->siteParameterResolver = $siteParameterResolver;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();

        // Shield mode activated
        if ($this->manager->isActive('shield_mode')) {
            $username = $this->siteParameterResolver->getValue('security.shield_mode.username');
            if (null == $username) {
                $username = 'admin';
            }
            $pwd = $this->siteParameterResolver->getValue('security.shield_mode.password');
            $authString = base64_encode($username.':'.$pwd);

            if (false == strpos($request->headers->get('Authorization'), $authString)) {
                $event->setResponse(new Response('Access restricted'));
                $event->getResponse()->headers->set('WWW-Authenticate', 'Basic realm="Member Area"');
                $event->getResponse()->setStatusCode('401');
            }
        }

        // Disabled feature flag on requested url
        $flag = $request->attributes->get('_feature_flag');

        if (null !== $flag && !$this->manager->isActive($flag)) {
            $message = $this->translator->trans('error.feature_not_enabled', array(), 'CapcoAppBundle');
            throw new NotFoundHttpException($message);
        }
    }
}
