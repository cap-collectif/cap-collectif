<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Repository\ParticipantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class ParticipantHelper
{
    public function __construct(private readonly ParticipantRepository $participantRepository, private readonly TokenGeneratorInterface $tokenGenerator, private readonly EntityManagerInterface $em)
    {
    }

    public function getParticipantByToken(?string $token = null): ?Participant
    {
        if (!$token) {
            throw new ParticipantNotFoundException();
        }

        $base64Token = base64_decode($token);
        $participant = $this->participantRepository->findByTokens($token, $base64Token);

        if (!$participant instanceof Participant) {
            throw new ParticipantNotFoundException();
        }

        return $participant;
    }

    public function getOrCreateParticipant(?string $token = null): Participant
    {
        if (!$token) {
            return $this->createParticipant();
        }

        try {
            return $this->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            return $this->createParticipant();
        }
    }

    private function createParticipant(): Participant
    {
        $newToken = $this->tokenGenerator->generateToken();
        $participant = new Participant();
        $participant->setToken($newToken);
        $this->em->persist($participant);
        $this->em->flush();

        return $participant;
    }
}
