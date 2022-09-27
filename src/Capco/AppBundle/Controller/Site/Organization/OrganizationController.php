<?php

namespace Capco\AppBundle\Controller\Site\Organization;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OrganizationController extends AbstractController
{
    private PendingOrganizationInvitationRepository $repository;
    private TranslatorInterface $translator;
    private RouterInterface $router;
    private EntityManagerInterface $em;
    private LoggerInterface $logger;

    public function __construct(
        PendingOrganizationInvitationRepository $repository,
        TranslatorInterface $translator,
        RouterInterface $router,
        EntityManagerInterface $em,
        LoggerInterface $logger
    ) {
        $this->repository = $repository;
        $this->translator = $translator;
        $this->router = $router;
        $this->em = $em;
        $this->logger = $logger;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Route("/invitation/organization/{token}", name="capco_app_organization_invitation", options={"i18n" = false})
     */
    public function acceptInvitation(string $token): RedirectResponse
    {
        $invitation = $this->repository->findOneBy([
            'token' => $token,
            'user' => $this->getUser(),
        ]);
        if (null === $invitation) {
            $this->addFlash(
                'danger',
                $this->translator->trans('invalid-token', [], 'CapcoAppBundle')
            );
            $this->logger->debug(
                __METHOD__ . ' : invalid token ' . $token . ' by ' . $this->getUser()->getUsername()
            );

            return new RedirectResponse('/');
        }

        $this->validateInvitation($invitation);

        return new RedirectResponse(
            $this->router->generate('capco_organization_profile_show', [
                'slug' => $invitation->getOrganization()->getSlug(),
            ])
        );
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
