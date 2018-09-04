<?php
namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Helper\EnvHelper;
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
        $manager = $this->container->get('fos_user.user_manager');
        $session = $this->container->get('session');
        $user = $manager->findUserByConfirmationToken($token);
        $response = new RedirectResponse($this->container->get('router')->generate('app_homepage'));

        if (!$user) {
            // We could not find a user with this token
            $session
                ->getFlashBag()
                ->set('sonata_user_success', 'global.alert.already_email_confirmed');

            return $response;
        }

        $user->setEnabled(true);

        $user->setLastLogin(new \DateTime());

        // We publish the user's contributions
        $hasPulishedContributions = $this->get('capco.contribution.manager')->publishContributions(
            $user
        );

        // If user has been created via API he has no password yet.
        // That's why we create a reset password request to let him chose a password
        if (null === $user->getPassword()) {
            $user->setPasswordRequestedAt(new \DateTime());
            $manager->updateUser($user);

            return $this->redirectToRoute('fos_user_resetting_reset', [
                'token' => $user->getConfirmationToken(),
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
            $session
                ->getFlashBag()
                ->set('sonata_user_success', 'global.alert.email_confirmed_with_republish');
        } else {
            $session->getFlashBag()->set('sonata_user_success', 'global.alert.email_confirmed');
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
        $manager = $this->container->get('fos_user.user_manager');
        $redirectResponse = new RedirectResponse(
            $this->container->get('router')->generate('app_homepage')
        );
        $user = $this->container->get('capco.user.repository')->findUserByNewEmailConfirmationToken(
            $token
        );
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

        $this->get('session')
            ->getFlashBag()
            ->add('success', $this->get('translator')->trans('global.alert.new_email_confirmed'));

        return $redirectResponse;
    }
}
