<?php

namespace Capco\UserBundle\Controller;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Manager\ContributionManager;
use FOS\UserBundle\Model\UserManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;

class ConfirmationController extends Controller
{
    /**
     * @Route("/account/email_confirmation/{token}", name="account_confirm_email")
     * @Route("/email-confirmation/{token}", name="account_confirm_email_legacy")
     *
     * @param mixed $token
     */
    public function emailAction($token)
    {
        /** @var UserManager $manager */
        $manager = $this->container->get('fos_user.user_manager');

        // We create a session for flashBag
        $flashBag = $this->container->get('session')->getFlashBag();

        /** @var User $user */
        $user = $manager->findUserByConfirmationToken($token);
        $response = new RedirectResponse($this->container->get('router')->generate('app_homepage'));

        if (!$user) {
            // We could not find a user with this token
            $flashBag->set('sonata_user_success', 'global.alert.already_email_confirmed');

            return $response;
        }

        $user->setEnabled(true);

        $user->setLastLogin(new \DateTime());

        // We publish the user's contributions
        $hasPulishedContributions = $this->get(ContributionManager::class)->publishContributions(
            $user
        );

        // If user has been created via API he has no password yet.
        // That's why we create a reset password request to let him chose a password
        if (null === $user->getPassword()) {
            $user->setPasswordRequestedAt(new \DateTime());
            $manager->updateUser($user);

            return $this->redirectToRoute('fos_user_resetting_reset', [
                'token' => $user->getResetPasswordToken(),
            ]);
        }

        // We can confirm by email the user
        $user->setConfirmationToken(null);

        $manager->updateUser($user);

        $this->get('fos_user.security.login_manager')->loginUser(
            $this->container->getParameter('fos_user.firewall_name'),
            $user,
            $response
        );

        if ($hasPulishedContributions) {
            $flashBag->set('sonata_user_success', 'global.alert.email_confirmed_with_republish');
        } else {
            $flashBag->set('sonata_user_success', 'global.alert.email_confirmed');
        }

        return $response;
    }

    /**
     * @Route("/account/new_email_confirmation/{token}", name="account_confirm_new_email")
     *
     * @param mixed $token
     */
    public function newEmailAction($token)
    {
        $redirectResponse = new RedirectResponse(
            $this->container->get('router')->generate('app_homepage')
        );
        $user = $this->container
            ->get('capco.user.repository')
            ->findUserByNewEmailConfirmationToken($token);
        if (!$user) {
            return $redirectResponse;
        }

        $user->setEmail($user->getNewEmailToConfirm());
        $user->setNewEmailConfirmationToken(null);
        $user->setNewEmailToConfirm(null);

        // confirm user, in case he isn't verified yet
        $user->setConfirmationToken(null);
        $user->setEnabled(true);

        $em = $this->getDoctrine()->getManager();
        $em->flush();

        $this->get('fos_user.security.login_manager')->loginUser(
            $this->container->getParameter('fos_user.firewall_name'),
            $user,
            $redirectResponse
        );

        // We create a session for flashBag
        $flashBag = $this->container->get('session')->getFlashBag();

        $flashBag->add(
            'success',
            $this->get('translator')->trans('global.alert.new_email_confirmed')
        );

        return $redirectResponse;
    }
}
