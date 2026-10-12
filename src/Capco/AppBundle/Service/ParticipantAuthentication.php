<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Participant;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/** Request identity for replies, independent of tokens resolved by GraphQL fields. */
class ParticipantAuthentication
{
    private const PARTICIPANT = 'authenticated_participant';

    public function __construct(
        private readonly ParticipantHelper $participantHelper,
        private readonly RequestStack $requestStack,
        private readonly TokenStorageInterface $tokenStorage
    ) {
    }

    public function authenticate(Request $request): void
    {
        $participant = null;
        if (!$this->tokenStorage->getToken()?->getUser() instanceof UserInterface
            && $request->cookies->has('CapcoParticipant')) {
            $participant = $this->participantHelper->getParticipantByToken($request->cookies->get('CapcoParticipant'));
        }
        $request->attributes->set(self::PARTICIPANT, $participant);
    }

    public function getParticipant(): ?Participant
    {
        return $this->requestStack->getCurrentRequest()?->attributes->get(self::PARTICIPANT);
    }
}
