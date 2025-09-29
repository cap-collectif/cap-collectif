<?php

namespace Capco\AppBundle\GraphQL\Resolver\EvaluationForm;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * @deprecated this is our legacy evaluation tool
 */
class EvaluationFormResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalRepository $proposalRepository
    ) {
    }

    public function __invoke(Questionnaire $evaluationForm, $user): Collection
    {
        $questions = $evaluationForm->getRealQuestions();
        $isEvaluer = false;
        if ($user instanceof User) {
            $proposalForm = $evaluationForm->getProposalForm();
            $isEvaluer = $this->proposalRepository->isViewerAnEvaluerOfAProposalOnForm(
                $proposalForm,
                $user
            );
        }
        $viewerCanSeePrivateQuestion = $isEvaluer || ($user instanceof User && $user->isAdmin());

        return $questions->filter(fn ($question) => !$question->isPrivate() || $viewerCanSeePrivateQuestion);
    }
}
