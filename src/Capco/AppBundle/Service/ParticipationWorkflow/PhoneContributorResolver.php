<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;

class PhoneContributorResolver
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly ParticipantRepository $participantRepository
    ) {
    }

    public function findConfirmedUserByPhone(ContributorInterface $contributor): ?User
    {
        $phone = $contributor->getPhone();
        if (!$phone) {
            return null;
        }

        return $this->userRepository->findConfirmedByPhone(
            $phone,
            $contributor instanceof User ? $contributor : null
        );
    }

    public function findConfirmedParticipantByPhone(ContributorInterface $contributor): ?Participant
    {
        $phone = $contributor->getPhone();
        if (!$phone) {
            return null;
        }

        return $this->participantRepository->findConfirmedByPhone(
            $phone,
            $contributor instanceof Participant ? $contributor : null
        );
    }
}
