<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\AnalysisConfigurationRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteQuestionnaireMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly AnalysisConfigurationRepository $analysisConfigurationRepository,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $id = $input->offsetGet('id');
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);
        $proposalForm = $questionnaire->getProposalForm();
        $step = $questionnaire->getStep();

        if ($step) {
            $step->setQuestionnaire(null);
        }

        if ($proposalForm) {
            $proposalForm->setEvaluationForm(null);
        }

        $analysisConfiguration = $this->analysisConfigurationRepository->findOneBy([
            'evaluationForm' => $questionnaire,
        ]);

        if ($analysisConfiguration) {
            $analysisConfiguration->setEvaluationForm(null);
        }

        $this->em->remove($questionnaire);
        $this->em->flush();

        return ['deletedQuestionnaireId' => $id];
    }

    public function isGranted(string $id, User $viewer): bool
    {
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        if ($questionnaire) {
            return $this->authorizationChecker->isGranted(
                QuestionnaireVoter::DELETE,
                $questionnaire
            );
        }

        return false;
    }
}
