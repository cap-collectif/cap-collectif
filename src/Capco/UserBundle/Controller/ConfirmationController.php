<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Manager\ContributionManager;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Service\Encryptor;
use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\AppBundle\Service\ParticipationWorkflow\VotesReconcilier;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ConfirmationController extends Controller
{
    public function __construct(
        private readonly UserManager $userManager,
        private readonly LoginManagerInterface $loginManager,
        private readonly RouterInterface $router,
        private readonly StepUrlResolver $stepUrlResolver,
        private readonly SessionInterface $session,
        private readonly ContributionManager $contributionManager,
        private readonly TranslatorInterface $translator,
        private readonly UserRepository $userRepo,
        private readonly AbstractStepRepository $stepRepo,
        private readonly CommentRepository $commentRepository,
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
        private readonly SendInBluePublisher $sendInBluePublisher,
        private readonly ParticipantRepository $participantRepository,
        private readonly Encryptor $encryptor,
        private readonly ReplyReconcilier $replyReconcilier,
        private readonly VotesReconcilier $votesReconcilier
    ) {
        $this->login = true;
    }

    /**
     * @Route("/account/email_confirmation/{token}", name="account_confirm_email", requirements={"token"="[A-Za-z0-9\-_]{43}"}, options={"i18n" = false})
     * @Route("/email-confirmation/{token}", name="account_confirm_email_legacy", requirements={"token"="[A-Za-z0-9\-_]{43}"}, options={"i18n" = false})
     * @Route("/account/email_confirmation/{token}/{stepId}", name="account_confirm_email_step", requirements={"token"="[A-Za-z0-9\-_]{43}", "stepId"="[A-Za-z0-9+/=]+"}, options={"i18n" = false})
     */
    public function emailAction(string $token, ?string $stepId = null): RedirectResponse
    {
        $step = $stepId ? $this->stepRepo->find($stepId) : null;

        $response = new RedirectResponse(
            $step ?
            $this->stepUrlResolver->__invoke($step) :
            $this->router->generate('app_homepage')
        );

        // We create a session for flashBag
        $flashBag = $this->session->getFlashBag();

        /** @var User $user */
        $user = $this->userManager->findUserByConfirmationToken($token);

        if (!$user) {
            // We could not find a user with this token
            $flashBag->add(
                'success',
                $this->translator->trans(
                    'global.alert.already_email_confirmed',
                    [],
                    'CapcoAppBundle'
                )
            );

            return $response;
        }

        $user->setEnabled(true);
        $user->setLastLogin(new \DateTime());

        $hasPublishedContributions = $this->confirmUser($user);

        // If user has been created via API he has no password yet.
        // That's why we create a reset password request to let him chose a password
        if (null === $user->getPassword()) {
            $user->setPasswordRequestedAt(new \DateTime());

            // This will flush
            $this->userManager->updateUser($user);

            return $this->redirectToRoute('fos_user_resetting_reset', [
                'token' => $user->getResetPasswordToken(),
            ]);
        }

        // This will flush
        $this->userManager->updateUser($user);
        if ($user->isConsentInternalCommunication()) {
            $this->sendInBluePublisher->pushToSendinblue('addEmailToSendInBlue', ['email' => $user->getEmail()]);
        }
        if ($this->login) {
            $this->loginManager->loginUser('main', $user, $response);
        }

        $this->addConfirmationMessageToFlashbag($step, $hasPublishedContributions);

        return $response;
    }

    /**
     * @Route("/account/new_email_confirmation/{token}", name="account_confirm_new_email", options={"i18n" = false})
     */
    public function newEmailAction(string $token): RedirectResponse
    {
        $response = new RedirectResponse($this->router->generate('app_homepage'));

        // We create a session for flashBag
        $flashBag = $this->session->getFlashBag();

        $user = $this->userRepo->findUserByNewEmailConfirmationToken($token);

        if (!$user) {
            // We could not find a user with this token
            $flashBag->add(
                'success',
                $this->translator->trans(
                    'global.alert.already_email_confirmed',
                    [],
                    'CapcoAppBundle'
                )
            );

            return $response;
        }

        $user->setEmail($user->getNewEmailToConfirm());
        $user->setNewEmailConfirmationToken(null);
        $user->setNewEmailToConfirm(null);

        // We must confirm the user, in case he isn't verified yet
        // it happen when a user update his email without
        // confirming his first email.
        if (!$user->isEmailConfirmed()) {
            $this->confirmUser($user);
        }

        // This will flush
        $this->userManager->updateUser($user);

        if ($this->login) {
            $this->loginManager->loginUser('main', $user, $response);
        }

        $flashBag->add(
            'success',
            $this->translator->trans('global.alert.new_email_confirmed', [], 'CapcoAppBundle')
        );

        return $response;
    }

    /**
     * @Route("/comment/email_confirmation/{token}", name="comment_confirm_email", options={"i18n" = false})
     */
    public function commentConfirmAnonymousEmail(string $token): RedirectResponse
    {
        $response = new RedirectResponse($this->router->generate('app_homepage'));

        $flashBag = $this->session->getFlashBag();

        $comment = $this->commentRepository->findOneBy(['confirmationToken' => $token]);

        if (!$comment) {
            $this->logger->error(__METHOD__ . ' : comment with token: ' . $token . 'was not found');

            // We could not find a comment with this token
            $flashBag->add(
                'error',
                $this->translator->trans('no-token-matching-comment', [], 'CapcoAppBundle')
            );

            return $response;
        }

        $comment->setConfirmationToken(null);
        $this->em->flush();

        $flashBag->add(
            'success',
            $this->translator->trans(
                'comment-email-confirm-waiting-for-moderation',
                [],
                'CapcoAppBundle'
            )
        );

        return $response;
    }

    /**
     * @Route("/participant/new_email_confirmation/{token}", name="participant_confirm_new_email", options={"i18n" = false})
     */
    public function confirmEmailParticipantAction(Request $request, string $token): RedirectResponse
    {
        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        $redirectUrl = $request->get('redirectUrl');
        $homePageUrl = $this->router->generate('app_homepage');

        $responseUrl = $redirectUrl ?? $homePageUrl;
        $response = new RedirectResponse($responseUrl);

        $participant = $this->participantRepository->findOneBy(['newEmailConfirmationToken' => $token]);

        if (!$participant instanceof Participant) {
            return $response;
        }

        $participationCookies = $request->get('participationCookies');
        $decryptedParticipationCookies = $this->encryptor->decryptData($participationCookies);
        $cookies = json_decode($decryptedParticipationCookies, true);

        $existingParticipant = $this->participantRepository->findOneBy([
            'email' => $participant->getNewEmailToConfirm(),
            'confirmationToken' => null,
        ]);

        if (($cookies['replyCookie'] ?? null) && !$existingParticipant) {
            $decryptedReplyCookie = $this->encryptor->decryptData($cookies['replyCookie']);
            $replyCookie = Cookie::create(ParticipationCookieManager::REPLY_COOKIE, $decryptedReplyCookie, (new \DateTime())->modify('+1 year'), null, null, false, false);
            $response->headers->setCookie($replyCookie);
        }

        if ($existingParticipant && $cookies['replyCookie']) {
            $this->replyReconcilier->reconcile($participant, $existingParticipant);
            $this->replyReconcilier->updateParticipantInfos($existingParticipant, $participant);
            $this->em->flush();
            $jsonReplies = $this->replyReconcilier->getJSONReplies($existingParticipant);

            $replyCookie = Cookie::create(ParticipationCookieManager::REPLY_COOKIE, base64_encode($jsonReplies), (new \DateTime())->modify('+1 year'), null, null, false, false);
            $response->headers->setCookie($replyCookie);
        }

        if (($cookies['participantCookie'] ?? null) && !$existingParticipant) {
            $decryptedParticipantCookies = $this->encryptor->decryptData($cookies['participantCookie']);
            $participantCookie = Cookie::create(ParticipationCookieManager::PARTICIPANT_COOKIE, $decryptedParticipantCookies, (new \DateTime())->modify('+1 year'), null, null, false, false);
            $response->headers->setCookie($participantCookie);
        }

        if ($existingParticipant && ($cookies['participantCookie'] ?? null)) {
            $this->votesReconcilier->reconcile($participant, $existingParticipant);
            $this->votesReconcilier->updateParticipantInfos($existingParticipant, $participant);
            $decryptedParticipantCookies = $this->encryptor->decryptData($cookies['participantCookie']);
            $participantCookie = Cookie::create(ParticipationCookieManager::PARTICIPANT_COOKIE, $decryptedParticipantCookies, (new \DateTime())->modify('+1 year'), null, null, false, false);
            $response->headers->setCookie($participantCookie);
            $this->em->flush();
        }

        if ($existingParticipant) {
            $this->em->remove($participant);
            $this->em->flush();

            return $response;
        }

        $participant->setEmail($participant->getNewEmailToConfirm());
        $participant->setNewEmailConfirmationToken(null);
        $participant->setNewEmailToConfirm(null);

        if (!$participant->isEmailConfirmed()) {
            $participant->setConfirmationToken(null);
        }

        $this->em->flush();

        return $response;
    }

    /**
     * @Route("/preserve_account_data/{token}", name="preserve_account_data", options={"i18n" = false})
     */
    public function preserveAccountData(string $token): RedirectResponse
    {
        $response = new RedirectResponse($this->router->generate('app_homepage'));
        $flashBag = $this->session->getFlashBag();

        $user = $this->userRepo->findOneBy(['anonymizationReminderEmailToken' => $token]);

        if (!$user) {
            $flashBag->add(
                'danger',
                $this->translator->trans(
                    'invalid-token',
                    [],
                    'CapcoAppBundle'
                )
            );

            return $response;
        }

        $user->setLastLogin(new \DateTime());
        $user->setAnonymizationReminderEmailSentAt(null);
        $this->em->flush();

        $flashBag->add(
            'success',
            $this->translator->trans(
                'preserve-data-toast-message',
                [],
                'CapcoAppBundle'
            )
        );

        return $response;
    }

    private function addConfirmationMessageToFlashbag(?AbstractStep $step, bool $hasPublishedContributions): void
    {
        $type = ($step && $step->isClosed()) ? 'danger' : 'success';
        $message = $step ?
            ($step->isOpen() ?
                'confirmation-contribution-validation' :
                'error-contribution-validation') :
            ($hasPublishedContributions ?
                'global.alert.email_confirmed_with_republish' :
                'global.alert.email_confirmed');

        $this->session->getFlashBag()->add(
            $type,
            $this->translator->trans($message, [], 'CapcoAppBundle')
        );
    }

    /**
     * Handle the confirmation of a user logic.
     */
    private function confirmUser(User $user): bool
    {
        // We publish the user's contributions
        $hasPulishedContributions = $this->contributionManager->publishContributions($user);

        // We can confirm by email the user
        $user->setConfirmationToken(null);
        $user->setEnabled(true);
        $user->setConfirmedAccountAt(new \DateTime());

        return $hasPulishedContributions;
    }
}
