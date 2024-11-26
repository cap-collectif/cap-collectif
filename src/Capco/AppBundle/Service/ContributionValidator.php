<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class ContributionValidator
{
    private readonly EntityManagerInterface $em;
    private readonly AbstractVoteRepository $abstractVoteRepository;

    public function __construct(
        AbstractVoteRepository $abstractVoteRepository,
        EntityManagerInterface $em
    ) {
        $this->em = $em;
        $this->abstractVoteRepository = $abstractVoteRepository;
    }

    /**
     * @throws ContributorAlreadyUsedPhoneException
     */
    public function validatePhoneReusability(string $phone, AbstractVote $vote, SelectionStep $step, ?string $token = null, ?User $user = null): void
    {
        /** * @var Requirement $requirement */
        $hasPhoneVerifiedRequirements = $step->getRequirements()->filter(fn ($requirement) => Requirement::PHONE_VERIFIED === $requirement->getType())->count() > 0;

        if (!$hasPhoneVerifiedRequirements) {
            return;
        }

        $votesCount = $this->abstractVoteRepository->findExistingVoteByStepAndPhoneNumber($step, $phone, $token, $user);

        if ($votesCount > 0) {
            $this->em->remove($vote);
            $this->em->flush();

            throw new ContributorAlreadyUsedPhoneException();
        }
    }
}
