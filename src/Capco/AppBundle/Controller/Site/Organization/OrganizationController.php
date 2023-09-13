<?php

namespace Capco\AppBundle\Controller\Site\Organization;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class OrganizationController extends AbstractController
{
    private PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository;
    private TranslatorInterface $translator;
    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private LoginManagerInterface $loginManager;

    public function __construct(
        PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository,
        TranslatorInterface $translator,
        EntityManagerInterface $em,
        LoggerInterface $logger,
        LoginManagerInterface $loginManager
    ) {
        $this->pendingOrganizationInvitationRepository = $pendingOrganizationInvitationRepository;
        $this->translator = $translator;
        $this->em = $em;
        $this->logger = $logger;
        $this->loginManager = $loginManager;
    }

    /**
     * @Route("/invitation/organization/{token}", name="capco_app_organization_invitation", options={"i18n" = false})
     */
    public function acceptInvitation(string $token): RedirectResponse
    {
        $invitation = $this->pendingOrganizationInvitationRepository->findOneBy([
            'token' => $token,
        ]);
        $response = new RedirectResponse('/admin-next/projects');
        $viewerIsConnected = $this->getUser() instanceof User;
        if (
            null === $invitation
            || ($viewerIsConnected && $invitation->getUser() !== $this->getUser())
        ) {
            $this->addFlash(
                'danger',
                $this->translator->trans('invalid-token', [], 'CapcoAppBundle')
            );
            $this->logger->debug(__METHOD__ . ' : invalid token ' . $token);
            $response->setTargetUrl('/');

            return $response;
        }

        $this->validateInvitation($invitation);
        if (!$viewerIsConnected && $invitation->getUser()) {
            $this->loginManager->logInUser('main', $invitation->getUser(), $response);
        }
        $this->addFlash(
            'success',
            $this->translator->trans(
                'notify-success-joint-organization',
                ['organizationName' => $invitation->getOrganization()->getTitle()],
                'CapcoAppBundle'
            )
        );

        return $response;
    }

    private function validateInvitation(PendingOrganizationInvitation $invitation): void
    {
        $memberShip = new OrganizationMember();
        $memberShip->setOrganization($invitation->getOrganization());
        $memberShip->setUser($invitation->getUser());
        $memberShip->setRole($invitation->getRole());

        $this->em->remove($invitation);

        $this->em->persist($memberShip);
        $this->em->flush();
        $this->logger->debug(
            __METHOD__ .
                ' : ' .
                $invitation->getUser()->getUsername() .
                ' joins ' .
                $invitation->getOrganization()->getUsername()
        );
    }
}
