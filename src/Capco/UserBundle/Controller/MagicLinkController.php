<?php

declare(strict_types=1);

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Service\Encryptor;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\AppBundle\Service\ParticipationWorkflow\VotesReconcilier;
use Capco\UserBundle\Authenticator\MagicLinkAuthenticator;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\Security\Http\SecurityEvents;
use Symfony\Contracts\Translation\TranslatorInterface;

class MagicLinkController extends AbstractController
{
    public function __construct(
        private readonly MagicLinkAuthenticator $magicLinkAuthenticator,
        private readonly LoggerInterface $logger,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly EventDispatcherInterface $eventDispatcher,
        private readonly Encryptor $encryptor,
        private readonly ReplyReconcilier $replyReconcilier,
        private readonly ParticipantHelper $participantHelper,
        private readonly EntityManagerInterface $em,
        private readonly VotesReconcilier $votesReconcilier,
        private readonly TranslatorInterface $translator
    ) {
    }

    /**
     * @Route("/magic-link/{token}", name="capco_magic_link", methods={"GET"}, options={"i18n" = false})
     */
    public function magicLinkAction(Request $request, string $token): Response
    {
        try {
            $securityToken = $this->magicLinkAuthenticator->authenticateToken($token);
            $redirectUrl = $this->magicLinkAuthenticator->getRedirectUrl();
        } catch (\Throwable $th) {
            $this->logger->error($th->getMessage());
            $this->addFlash('danger', $this->translator->trans('invalid-token'));

            return $this->redirectToRoute('app_homepage');
        }

        $participationCookies = $request->get('participationCookies');
        $decryptedParticipationCookies = $this->encryptor->decryptData($participationCookies);
        $cookies = json_decode($decryptedParticipationCookies, true);

        $decryptedReplyCookie = ($cookies['replyCookie'] ?? null) ? $this->encryptor->decryptData($cookies['replyCookie']) : null;
        $decryptedParticipantCookie = ($cookies['participantCookie'] ?? null) ? $this->encryptor->decryptData($cookies['participantCookie']) : null;

        if ($decryptedParticipantCookie) {
            try {
                $participant = $this->participantHelper->getParticipantByToken($decryptedParticipantCookie);
            } catch (ParticipantNotFoundException) {
                $this->addFlash('danger', $this->translator->trans('invalid-token'));

                return $this->redirectToRoute('app_homepage');
            }

            $this->tokenStorage->setToken($securityToken);
            $viewer = $this->tokenStorage->getToken()->getUser();

            $this->votesReconcilier->reconcile($participant, $viewer);

            if ($decryptedReplyCookie) {
                $this->replyReconcilier->reconcile($participant, $viewer);
            }

            $this->em->remove($participant);
            $this->em->flush();
        }

        $event = new InteractiveLoginEvent($request, $securityToken);
        $this->eventDispatcher->dispatch($event, SecurityEvents::INTERACTIVE_LOGIN);

        return $redirectUrl ? $this->redirect($redirectUrl) : $this->redirectToRoute('app_homepage');
    }
}
