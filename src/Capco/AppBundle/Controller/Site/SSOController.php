<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SSOController extends Controller
{
    public function __construct(protected Manager $toggleManager, protected AbstractSSOConfigurationRepository $ssoRepository, protected OpenIDReferrerResolver $referrerResolver, protected FranceConnectSSOConfigurationRepository $fcRepository, protected Oauth2SSOConfigurationRepository $authRepository)
    {
    }

    /**
     * @Route("/sso/switch-user", name="app_sso_switch_user", options={"i18n" = false})
     * @Template("@CapcoApp/Default:sso_switch_user.html.twig")
     */
    public function switchUserAction()
    {
        $user = $this->getUser();

        if (!$user || !$this->toggleManager->isActive('oauth2_switch_user')) {
            return $this->redirect('/');
        }

        return [];
    }

    /**
     * @Route("/sso/profile", name="app_sso_profile", options={"i18n" = false})
     */
    public function profileAction(Request $request): RedirectResponse
    {
        $user = $this->getUser();

        if (!$user || $this->toggleManager->isActive('profiles')) {
            return $this->redirect('/');
        }

        $ssoConfiguration = null;

        if ($user->isFranceConnectAccount()) {
            $ssoConfiguration = $this->fcRepository->findOneBy(['enabled' => 1]);
        } elseif ($user->isOpenidAccount()) {
            $ssoConfiguration = $this->authRepository->findOneBy(['enabled' => 1]);
        } else {
            $ssoConfiguration = $this->ssoRepository->findOneBy(['enabled' => 1]);
        }

        if (!$ssoConfiguration || !$ssoConfiguration->getProfileUrl()) {
            return $this->redirect('/');
        }

        $referrerParameter = $this->referrerResolver->getRefererParameterForProfile();

        return $this->redirect(
            sprintf(
                '%s?%s',
                $ssoConfiguration->getProfileUrl(),
                http_build_query([
                    $referrerParameter => $request->query->get('referrer', $request->getBaseUrl()),
                ])
            )
        );
    }
}
