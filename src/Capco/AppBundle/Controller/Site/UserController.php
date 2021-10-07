<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;

class UserController extends AbstractController
{
    /**
     * @Route("/invitation", name="capco_app_user_invitation", options={"i18n" = false})
     * @Template("@CapcoApp/User/invitation.html.twig")
     */
    public function invitation(
        Request $request,
        UserInviteRepository $repository,
        EntityManagerInterface $em,
        Manager $toggleManager,
        RouterInterface $router,
        AbstractSSOConfigurationRepository $ssoConfigurationRepository
    ) {
        $token = $request->get('token') ?? '';

        $baseUrl = $router->generate('capco_app_user_invitation', compact('token'));

        $ssoConfigurations = $ssoConfigurationRepository
            ->getPaginated(100, 0)
            ->getIterator()
            ->getArrayCopy();

        $loginFranceConnectEnabled = $toggleManager->isActive('login_franceconnect');
        $loginFranceConnect =
            \count(
                array_filter($ssoConfigurations, function ($sso) use ($loginFranceConnectEnabled) {
                    return $sso instanceof FranceConnectSSOConfiguration &&
                        true === $sso->isEnabled() &&
                        true === $loginFranceConnectEnabled;
                })
            ) > 0;

        $loginSaml = $toggleManager->isActive('login_saml');
        $loginCas = $toggleManager->isActive('login_cas');

        $ssoList = array_filter($ssoConfigurations, function ($sso) {
            return $sso instanceof Oauth2SSOConfiguration && true === $sso->isEnabled();
        });

        $ssoList = array_values(
            array_map(function ($sso) {
                return [
                    'type' => 'oauth2',
                    'name' => $sso->getName(),
                ];
            }, $ssoList)
        );

        if ($loginSaml) {
            $ssoList[] = ['type' => 'saml', 'name' => 'Saml'];
        }

        if ($loginCas) {
            $ssoList[] = ['type' => 'cas', 'name' => 'Cas'];
        }

        $hasEnabledSSO = $loginFranceConnect || \count($ssoList) > 0;

        $invitation = $repository->findOneByToken($token);

        if (!$invitation) {
            return $this->redirectToRoute('app_homepage');
        }

        if ($invitation->hasExpired()) {
            $this->addFlash('danger', 'user-invitation-expired');
            $em->remove($invitation);
            $em->flush();

            return $this->redirectToRoute('app_homepage');
        }

        $email = $invitation->getEmail();

        return compact(
            'token',
            'email',
            'baseUrl',
            'loginFranceConnect',
            'ssoList',
            'hasEnabledSSO'
        );
    }
}
