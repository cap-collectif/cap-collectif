<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
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
        UserRepository $userRepository,
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
        $loginFranceConnect = $loginFranceConnectEnabled && $ssoConfigurationRepository->findOneActiveByType('franceconnect');
        $loginFacebook = $ssoConfigurationRepository->findOneActiveByType('facebook') !== null;

        $loginSaml = $toggleManager->isActive('login_saml');
        $loginCas = $toggleManager->isActive('login_cas');
        $loginParis = $toggleManager->isActive('login_paris');

        $ssoList = array_filter($ssoConfigurations, function ($sso) use ($loginCas) {
            return ($sso instanceof Oauth2SSOConfiguration ||
                ($sso instanceof CASSSOConfiguration && $loginCas)) &&
                true === $sso->isEnabled();
        });

        $ssoList = array_values(
            array_map(function ($sso) {
                if ($sso instanceof Oauth2SSOConfiguration) {
                    return [
                        'type' => 'oauth2',
                        'name' => $sso->getName(),
                    ];
                }
                if ($sso instanceof CASSSOConfiguration) {
                    return [
                        'type' => 'cas',
                        'name' => $sso->getName(),
                    ];
                }
            }, $ssoList)
        );

        if ($loginSaml) {
            $ssoList[] = ['type' => 'saml', 'name' => 'Saml'];
        }

        $hasEnabledSSO =
            $loginParis || $loginFacebook || $loginFranceConnect || \count($ssoList) > 0;

        $invitation = $repository->findOneByToken($token);

        if (!$invitation) {
            return $this->redirectToRoute('app_homepage');
        }

        $email = $invitation->getEmail();
        if ($userRepository->findOneByEmail($email)) {
            if ($redirectionUrl = $invitation->getRedirectionUrl()) {
                return $this->redirect($redirectionUrl);
            }

            return $this->redirectToRoute('app_homepage');
        }

        if ($invitation->hasExpired()) {
            $this->addFlash('danger', 'user-invitation-expired');
            $em->remove($invitation);
            $em->flush();

            return $this->redirectToRoute('app_homepage');
        }

        return compact(
            'token',
            'email',
            'baseUrl',
            'loginFacebook',
            'loginParis',
            'loginFranceConnect',
            'ssoList',
            'hasEnabledSSO'
        );
    }
}
