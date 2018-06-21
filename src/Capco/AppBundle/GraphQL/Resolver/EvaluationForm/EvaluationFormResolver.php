<?php

namespace Capco\AppBundle\GraphQL\Resolver\EvaluationForm;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class EvaluationFormResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveQuestions(Questionnaire $evaluationForm, $user): Collection
    {
        $questions = $evaluationForm->getRealQuestions();
        $isEvaluer = false;
        if ($user instanceof User) {
            $proposalForm = $evaluationForm->getProposalForm();
            $isEvaluer = $this->container->get('capco.proposal.repository')->isViewerAnEvaluerOfAProposalOnForm($proposalForm, $user);
        }
        $viewerCanSeePrivateQuestion = $isEvaluer || ($user instanceof User && $user->isAdmin());

        return $questions->filter(
          function ($question) use ($viewerCanSeePrivateQuestion) {
              return !$question->isPrivate() || $viewerCanSeePrivateQuestion;
          }
        );
    }
}
