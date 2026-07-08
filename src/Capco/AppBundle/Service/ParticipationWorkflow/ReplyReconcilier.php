<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
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

            if (!$this->canReconcileForStep($step, $participant, $contributorTarget)) {
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
