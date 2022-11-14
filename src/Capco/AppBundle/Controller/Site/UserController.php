<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserController extends AbstractController
{
    private UserInviteRepository $userInviteRepository;
    private UserRepository $userRepository;
    private AbstractSSOConfigurationRepository $ssoConfigurationRepository;
    private EntityManagerInterface $em;
    private Manager $toggleManager;
    private RouterInterface $router;
    private LoggerInterface $logger;
    private TranslatorInterface $translator;

    public function __construct(
        UserInviteRepository $userInviteRepository,
        UserRepository $userRepository,
        AbstractSSOConfigurationRepository $ssoConfigurationRepository,
        EntityManagerInterface $em,
        Manager $toggleManager,
        RouterInterface $router,
        LoggerInterface $logger,
        TranslatorInterface $translator
    ) {
        $this->userInviteRepository = $userInviteRepository;
        $this->userRepository = $userRepository;
        $this->ssoConfigurationRepository = $ssoConfigurationRepository;
        $this->em = $em;
        $this->toggleManager = $toggleManager;
        $this->router = $router;
        $this->logger = $logger;
        $this->translator = $translator;
    }

    /**
     * @Route("/invitation", name="capco_app_user_invitation", options={"i18n" = false})
     * @Route("/invitation/", name="capco_app_user_invitation_trailing_slash", options={"i18n" = false})
     * @Template("@CapcoApp/User/invitation.html.twig")
     */
    public function invitation(Request $request)
    {
        try {
            $token = $request->get('token') ?? '';
            $invitation = $this->getInvitation($token);
            if ($this->accountAlreadyCreated($invitation)) {
                return $this->redirectFollowingInvitation($invitation);
            }
            $this->checkInvitation($invitation);
        } catch (UserError $error) {
            $this->logger->info($error->getMessage());

            return $this->redirectToHomepage();
        }

        $ssoList = $this->getSSOList();

        return [
            'token' => $token,
            'email' => $invitation->getEmail(),
            'baseUrl' => $this->getInvitationUrl($token),
            'loginFacebook' => $this->isFacebookEnabled(),
            'loginFranceConnect' => $this->isFranceConnectEnabled(),
            'ssoList' => array_values($ssoList),
            'hasEnabledSSO' => $this->hasAnyEnabledSSO($ssoList),
            'isRegistrationAllowed' => $this->toggleManager->isActive('registration'),
        ];
    }

    private function redirectToHomepage(): RedirectResponse
    {
        return $this->redirectToRoute('app_homepage');
    }

    private function redirectFollowingInvitation(UserInvite $invitation): RedirectResponse
    {
        return $invitation->getRedirectionUrl()
            ? $this->redirect($invitation->getRedirectionUrl())
            : $this->redirectToHomepage();
    }

    private function getInvitationUrl(string $token): string
    {
        return $this->router->generate('capco_app_user_invitation', ['token' => $token]);
    }

    private function getInvitation(string $token): UserInvite
    {
        $invitation = $this->userInviteRepository->findOneByToken($token);
        if ($invitation) {
            return $invitation;
        }

        $this->logger->error("Invitation matching token : {$token} not found.");
        $this->addFlash('danger', $this->translator->trans('invalid-token', [], 'CapcoAppBundle'));

        throw new UserError('invitation not found : ' . $token);
    }

    private function checkInvitation(UserInvite $invitation): void
    {
        if ($invitation->hasExpired()) {
            $this->addFlash('danger', 'user-invitation-expired');
            $this->em->remove($invitation);
            $this->em->flush();

            throw new UserError('invitation expired for token : ' . $invitation->getToken());
        }
    }

    private function accountAlreadyCreated(UserInvite $invitation): bool
    {
        return null !== $this->userRepository->findOneByEmail($invitation->getEmail());
    }

    private function getSSOList(): array
    {
        $ssoList = $this->ssoConfigurationRepository->findBy(['enabled' => true]);
        $ssoList = array_values(
            array_map(function ($sso) {
                if ($sso instanceof Oauth2SSOConfiguration) {
                    return [
                        'type' => 'oauth2',
                        'name' => $sso->getName(),
                    ];
                }
                if ($sso instanceof CASSSOConfiguration && $this->isCASEnabled()) {
                    return [
                        'type' => 'cas',
                        'name' => $sso->getName(),
                    ];
                }

                return null;
            }, $ssoList)
        );
        $ssoList = array_filter($ssoList, function ($sso) {
            return null !== $sso;
        });
        if ($this->isSAMLEnabled()) {
            $ssoList[] = ['type' => 'saml', 'name' => 'Saml'];
        }

        return $ssoList;
    }

    private function hasAnyEnabledSSO(array $ssoList): bool
    {
        return $this->isFacebookEnabled() ||
            $this->isFranceConnectEnabled() ||
            \count($ssoList) > 0;
    }

    private function isFacebookEnabled(): bool
    {
        return null !== $this->ssoConfigurationRepository->findOneActiveByType('facebook');
    }

    private function isFranceConnectEnabled(): bool
    {
        return $this->toggleManager->isActive('login_franceconnect') &&
            $this->ssoConfigurationRepository->findOneActiveByType('franceconnect');
    }

    private function isSAMLEnabled(): bool
    {
        return $this->toggleManager->isActive('login_saml');
    }

    private function isCASEnabled(): bool
    {
        return $this->toggleManager->isActive('login_cas');
    }
}
