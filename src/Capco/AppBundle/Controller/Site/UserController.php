<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Repository\UserInviteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    /**
     * @Route("/invitation", name="capco_app_user_invitation", options={"i18n" = false})
     * @Template("@CapcoApp/User/invitation.html.twig")
     */
    public function invitation(
        Request $request,
        UserInviteRepository $repository,
        EntityManagerInterface $em
    ) {
        $token = $request->get('token') ?? '';
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

        return compact('token', 'email');
    }
}
