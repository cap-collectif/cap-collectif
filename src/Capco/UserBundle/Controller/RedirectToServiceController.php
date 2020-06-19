<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\Security\OAuthUtils;
use HWI\Bundle\OAuthBundle\Util\DomainWhitelist;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use HWI\Bundle\OAuthBundle\Controller\RedirectToServiceController as BaseController;
use Symfony\Contracts\Translation\TranslatorInterface;

class RedirectToServiceController extends BaseController
{
    private OAuthUtils $oauthUtils;

    private DomainWhitelist $domainWhitelist;

    private $firewallNames;

    private $targetPathParameter;

    private $failedUseReferer;

    private $useReferer;

    private Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository;
    private TranslatorInterface $translator;
    private Manager $toggleManager;

    public function __construct(
        OAuthUtils $oauthUtils,
        DomainWhitelist $domainWhitelist,
        array $firewallNames,
        ?string $targetPathParameter,
        bool $failedUseReferer,
        bool $useReferer,
        Oauth2SSOConfigurationRepository $oauth2SSOConfigurationRepository,
        TranslatorInterface $translator,
        Manager $toggleManager
    ) {
        $this->oauthUtils = $oauthUtils;
        $this->domainWhitelist = $domainWhitelist;
        $this->firewallNames = $firewallNames;
        $this->targetPathParameter = $targetPathParameter;
        $this->failedUseReferer = $failedUseReferer;
        $this->useReferer = $useReferer;
        $this->translator = $translator;
        $this->toggleManager = $toggleManager;
        $this->oauth2SSOConfigurationRepository = $oauth2SSOConfigurationRepository;
    }

    public function redirectToServiceAction(Request $request, $service): RedirectResponse
    {
        if (!$this->serviceHasEnabledFeature($service)) {
            $message = $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle');

            throw new NotFoundHttpException($message);
        }

        return parent::redirectToServiceAction($request, $service);
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

    private function storeReturnPath(Request $request, string $authorizationUrl): void
    {
        $session = $request->getSession();

        if (null === $session) {
            return;
        }

        $param = $this->targetPathParameter;

        foreach ($this->firewallNames as $providerKey) {
            $sessionKey = '_security.' . $providerKey . '.target_path';
            $sessionKeyFailure = '_security.' . $providerKey . '.failed_target_path';

            if (!empty($param) && ($targetUrl = $request->get($param))) {
                if (!$this->domainWhitelist->isValidTargetUrl($targetUrl)) {
                    throw new AccessDeniedHttpException('Not allowed to redirect to ' . $targetUrl);
                }

                $session->set($sessionKey, $targetUrl);
            }

            if (
                $this->failedUseReferer &&
                !$session->has($sessionKeyFailure) &&
                ($targetUrl = $request->headers->get('Referer')) &&
                $targetUrl !== $authorizationUrl
            ) {
                $session->set($sessionKeyFailure, $targetUrl);
            }

            if (
                $this->useReferer &&
                !$session->has($sessionKey) &&
                ($targetUrl = $request->headers->get('Referer')) &&
                $targetUrl !== $authorizationUrl
            ) {
                $session->set($sessionKey, $targetUrl);
            }
        }
    }
}
