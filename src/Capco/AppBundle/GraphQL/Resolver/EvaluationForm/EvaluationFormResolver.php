<?php

namespace Capco\AppBundle\GraphQL\Resolver\EvaluationForm;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class EvaluationFormResolver implements ResolverInterface
{
    private $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(Questionnaire $evaluationForm, $user): Collection
    {
        $questions = iterator_to_array($evaluationForm->getRealQuestions());
        $isEvaluer = false;
        if ($user instanceof User) {
            $proposalForm = $evaluationForm->getProposalForm();
            $isEvaluer = $this->proposalRepository->isViewerAnEvaluerOfAProposalOnForm(
                $proposalForm,
                $user
            );
        }
        $viewerCanSeePrivateQuestion = $isEvaluer || ($user instanceof User && $user->isAdmin());

        return array_filter($questions, function ($question) use ($viewerCanSeePrivateQuestion) {
            return !$question->isPrivate() || $viewerCanSeePrivateQuestion;
        });
    }
}
