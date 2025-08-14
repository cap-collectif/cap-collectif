<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ReplyReconcilier extends ContributionsReconcilier
{
    public function __construct(
        EntityManagerInterface $em,
        private readonly ReplyRepository $replyRepository,
        private readonly QuestionnaireRepository $questionnaireRepository
    ) {
        parent::__construct($em);
    }

    public function reconcile(Participant $participant, ContributorInterface $contributorTarget): void
    {
        $this->disableCompletionStatusFilter();

        $questionnaires = $this->questionnaireRepository->getWithRepliesByParticipant($participant);

        foreach ($questionnaires as $questionnaire) {
            $step = $questionnaire->getStep();

            if ($step->isClosed()) {
                continue;
            }

            $hasEmailVerifiedRequirement = $step->getRequirements()->filter(fn (Requirement $requirement) => Requirement::EMAIL_VERIFIED === $requirement->getType())->count() > 0;

            if (!$hasEmailVerifiedRequirement) {
                continue;
            }

            $isSameEmail = $participant->getEmail() === $contributorTarget->getEmail() && ($participant->isEmailConfirmed() && $contributorTarget->isEmailConfirmed());

            // participant->getEmail() returning null means he comes from magic link or attempting to log in through the workflow
            // if email verified is required and participant has an email different from the user we skip reconciling because we consider that they are not the same person
            // otherwise if he has no email set we can reconcile with the logged-in user assuming he is logged-in through the workflow with either email password / sso / magic link
            if (null !== $participant->getEmail() && !$isSameEmail) {
                continue;
            }

            $this->reconcileRepliesByQuestionnaire($questionnaire, $participant, $contributorTarget);
        }

        $this->em->flush();
    }

    public function getJSONReplies(Participant $participant): string
    {
        $this->disableCompletionStatusFilter();

        $questionnaires = $this->questionnaireRepository->getWithRepliesByParticipant($participant);

        $questionnairesJSON = [];

        foreach ($questionnaires as $questionnaire) {
            $questionnaireGlobalId = GlobalId::toGlobalId('Questionnaire', $questionnaire->getId());
            $replies = $this->replyRepository->findBy(['questionnaire' => $questionnaire, 'participant' => $participant]);

            $formattedReplies = [];
            foreach ($replies as $reply) {
                $formattedReplies[] = ['replyId' => GlobalId::toGlobalId('Reply', $reply->getId()), 'token' => $participant->getToken()];
            }

            $questionnairesJSON[$questionnaireGlobalId] = $formattedReplies;
        }

        return json_encode($questionnairesJSON) ?: '';
    }

    private function reconcileRepliesByQuestionnaire(Questionnaire $questionnaire, Participant $participant, ContributorInterface $contributorTarget): void
    {
        $participantReplies = $this->replyRepository->findBy(['questionnaire' => $questionnaire, 'participant' => $participant]);

        $targetKey = $contributorTarget instanceof User ? 'author' : 'participant';
        $targetReplies = $this->replyRepository->findBy(['questionnaire' => $questionnaire, $targetKey => $contributorTarget, 'completionStatus' => ContributionCompletionStatus::COMPLETED]);

        $canAddMoreReplies = $questionnaire->isMultipleRepliesAllowed() || 0 === \count($targetReplies);

        if (!$canAddMoreReplies) {
            return;
        }

        foreach ($participantReplies as $reply) {
            $this->reconcileContributor($reply, $contributorTarget);
        }
    }
}
