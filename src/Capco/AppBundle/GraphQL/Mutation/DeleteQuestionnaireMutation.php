<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\AnalysisConfigurationRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class DeleteQuestionnaireMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;

    private AnalysisConfigurationRepository $analysisConfigurationRepository;
    private AuthorizationChecker $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AnalysisConfigurationRepository $analysisConfigurationRepository,
        AuthorizationChecker $authorizationChecker
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->analysisConfigurationRepository = $analysisConfigurationRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('id');

        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        $proposalForm = $questionnaire->getProposalForm();

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
