<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class ContributionValidator
{
    public function __construct(
        private readonly ReplyRepository $replyRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository
    ) {
    }

    public function validatePhoneReusability(ContributorInterface $contributor, ContributionInterface $contribution, AbstractStep $step): void
    {
        /** * @var Requirement $requirement */
        $hasPhoneVerifiedRequirements = $step->getRequirements()->filter(fn ($requirement) => Requirement::PHONE_VERIFIED === $requirement->getType())->count() > 0;

        if (!$hasPhoneVerifiedRequirements) {
            return;
        }

        $phone = $contributor->getPhone();

        if (!$phone) {
            return;
        }

        if ($contribution instanceof Reply) {
            $questionnaire = $contribution->getQuestionnaire();
            $replies = $this->replyRepository->findExistingContributorByQuestionnaireAndPhoneNumber($questionnaire, $phone, $contributor);
            if (\count($replies) > 0) {
                $this->em->remove($contribution);
                $contributor->setPhoneConfirmed(false);
                $this->em->flush();

                throw new ContributorAlreadyUsedPhoneException();
            }
        } elseif ($contribution instanceof ProposalSelectionVote) {
            $step = $contribution->getStep();
            $votes = $this->proposalSelectionVoteRepository->findExistingContributorByStepAndPhoneNumber($step, $phone, $contributor);
            if (\count($votes) > 0) {
                $this->em->remove($contribution);
                $contributor->setPhoneConfirmed(false);
                $this->em->flush();

                throw new ContributorAlreadyUsedPhoneException();
            }
        } elseif ($contribution instanceof ProposalCollectVote) {
            $step = $contribution->getStep();
            $votes = $this->proposalCollectVoteRepository->findExistingContributorByStepAndPhoneNumber($step, $phone, $contributor);
            if (\count($votes) > 0) {
                $this->em->remove($contribution);
                $contributor->setPhoneConfirmed(false);
                $this->em->flush();

                throw new ContributorAlreadyUsedPhoneException();
            }
        }
    }

    public function canContributeAgain(AbstractStep $step, ContributorInterface $contributor): bool
    {
        if ($step instanceof QuestionnaireStep) {
            return $this->canContributeAgainReply($step->getQuestionnaire(), $contributor);
        }
        if ($step instanceof ProposalStepInterface) {
            return $this->canContributeAgainProposalStepVote($step, $contributor);
        }

        return true;
    }

    private function canContributeAgainReply(Questionnaire $questionnaire, ContributorInterface $contributor): bool
    {
        if ($contributor instanceof User) {
            if ($questionnaire->isMultipleRepliesAllowed()) {
                return true;
            }

            $repliesCount = $this->replyRepository->count([
                'questionnaire' => $questionnaire,
                'completionStatus' => ContributionCompletionStatus::COMPLETED,
                'author' => $contributor,
            ]);

            if (0 === $repliesCount) {
                return true;
            }

            if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
                $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
            }

            // delete missing requirements replies for this questionnaire
            $repliesToDelete = $this->replyRepository->findBy([
                'questionnaire' => $questionnaire,
                'author' => $contributor,
                'completionStatus' => ContributionCompletionStatus::MISSING_REQUIREMENTS,
            ]);

            foreach ($repliesToDelete as $reply) {
                $this->em->remove($reply);
            }

            $this->em->flush();

            return false;
        }
        if ($contributor instanceof Participant) {
            $email = $contributor->getEmail();
            $user = $email ? $this->userRepository->findOneBy(['email' => $email, 'confirmationToken' => null]) : null;
            $participantAlreadyHasAnAccount = $user && $user->getEmail() === $email;

            if ($questionnaire->isMultipleRepliesAllowed()) {
                return true;
            }

            $params = [
                'questionnaire' => $questionnaire,
                'completionStatus' => ContributionCompletionStatus::COMPLETED,
            ];

            $repliesCount = $participantAlreadyHasAnAccount ? $this->replyRepository->count([...$params, 'author' => $user]) : $this->replyRepository->count([...$params, 'participant' => $contributor]);

            if (0 === $repliesCount) {
                return true;
            }

            if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
                $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
            }

            // delete missing requirements replies for this questionnaire
            $repliesToDelete = $this->replyRepository->findRepliesByParticipantTokenAndQuestionnaire($contributor->getToken(), $questionnaire);
            foreach ($repliesToDelete as $reply) {
                $this->em->remove($reply);
            }

            $this->em->flush();

            return false;
        }

        return true;
    }

    private function canContributeAgainProposalStepVote(ProposalStepInterface $step, ContributorInterface $contributor): bool
    {
        $votesLimit = $step->getVotesLimit();

        if (null === $votesLimit) {
            return true;
        }

        $repository = $step instanceof SelectionStep ? $this->proposalSelectionVoteRepository : $this->proposalCollectVoteRepository;
        $stepKey = $step instanceof SelectionStep ? 'selectionStep' : 'collectStep';

        if ($contributor instanceof User) {
            $votesCount = $repository->count([
                $stepKey => $step,
                'completionStatus' => ContributionCompletionStatus::COMPLETED,
                'user' => $contributor,
            ]);

            if ($votesLimit > $votesCount) {
                return true;
            }
            if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
                $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
            }
            $votesToDelete = $repository->findBy([
                $stepKey => $step,
                'completionStatus' => ContributionCompletionStatus::MISSING_REQUIREMENTS,
                'user' => $contributor,
            ]);

            foreach ($votesToDelete as $vote) {
                $this->em->remove($vote);
            }

            $this->em->flush();

            return false;
        }
        if ($contributor instanceof Participant) {
            $email = $contributor->getEmail();
            $user = $this->userRepository->findOneBy(['email' => $email, 'confirmationToken' => null]);
            $participantAlreadyHasAnAccount = $user && $user->getEmail() === $email;

            $params = [$stepKey => $step, 'completionStatus' => ContributionCompletionStatus::COMPLETED, 'user' => $user];

            $votesCount = $participantAlreadyHasAnAccount ? $repository->count($params) : $repository->countByConfirmedParticipantEmail($email, $step);

            if ($votesLimit > $votesCount) {
                return true;
            }

            if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
                $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
            }

            // delete missing requirements votes for this step
            $votesToDelete = $repository->findMissingRequirementsByParticipantTokenAndStep($contributor->getToken(), $step);

            foreach ($votesToDelete as $vote) {
                $this->em->remove($vote);
            }

            $this->em->flush();

            return false;
        }

        return true;
    }
}
