<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\AppBundle\Service\ParticipationWorkflow\VotesReconcilier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\Security\Http\SecurityEvents;

class ParticipationWorkflowSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ReplyReconcilier $replyReconcilier,
        private readonly EntityManagerInterface $em,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly ParticipantHelper $participantHelper,
        private readonly VotesReconcilier $votesReconcilier
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            SecurityEvents::INTERACTIVE_LOGIN => 'reconcilingContributions',
            KernelEvents::RESPONSE => 'removeParticipationCookies',
        ];
    }

    public function reconcilingContributions(InteractiveLoginEvent $event): void
    {
        $request = $event->getRequest();

        $participantTokenBase64 = $request->cookies->get('CapcoParticipant') ?? null;

        try {
            $participant = $this->participantHelper->getParticipantByToken($participantTokenBase64);
        } catch (ParticipantNotFoundException) {
            return;
        }

        /** * @var User $viewer  */
        $viewer = $event->getAuthenticationToken()->getUser();
        $anonRepliesCookie = $request->cookies->get('CapcoAnonReply') ?? null;

        if ($anonRepliesCookie) {
            $this->replyReconcilier->reconcile($participant, $viewer);
        }

        $this->votesReconcilier->reconcile($participant, $viewer);

        $hasVotes = $participant->getVotes()->count() > 0;
        $hasReplies = $participant->getReplies()->count() > 0;

        if ($hasVotes || $hasReplies) {
            return;
        }

        $this->em->remove($participant);
        $this->em->flush();
    }

    public function removeParticipationCookies(ResponseEvent $event): void
    {
        $currentUser = $this->tokenStorage->getToken() ? $this->tokenStorage->getToken()->getUser() : null;
        $isAuthenticated = $currentUser && 'anon.' !== $currentUser;

        if (!$isAuthenticated) {
            return;
        }

        $response = $event->getResponse();
        $response->headers->clearCookie('CapcoAnonReply');
        $response->headers->clearCookie('CapcoParticipant');
    }
}
