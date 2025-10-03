<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Form\Step\QuestionnaireStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateQuestionnaireStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly ActionLogger $actionLogger
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $questionnaireStepId = $input->offsetGet('stepId');
        $questionnaireStep = $this->getQuestionnaireStep($questionnaireStepId, $viewer);
        $operationType = $data['operationType'];

        unset($data['stepId'], $data['operationType']);

        $form = $this->formFactory->create(QuestionnaireStepFormType::class, $questionnaireStep);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        $this->actionLogger->logGraphQLMutation(
            $viewer,
            LogActionType::CREATE === $operationType ? LogActionType::CREATE : LogActionType::EDIT,
            sprintf('l\'étape de questionnaire %s du projet %s', $questionnaireStep->getTitle(), $questionnaireStep->getProject()->getTitle()),
            QuestionnaireStep::class,
            $questionnaireStep->getId()
        );

        return ['questionnaireStep' => $questionnaireStep];
    }

    public function isGranted(string $questionnaireStepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $questionnaireStep = $this->getQuestionnaireStep($questionnaireStepId, $viewer);
        $project = $questionnaireStep->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    public function getQuestionnaireStep(string $questionnaireStepId, User $viewer): QuestionnaireStep
    {
        $questionnaireStep = $this->globalIdResolver->resolve($questionnaireStepId, $viewer);
        if (!$questionnaireStep instanceof QuestionnaireStep) {
            throw new UserError("Given questionnaireStep id : {$questionnaireStepId} is not valid");
        }

        return $questionnaireStep;
    }
}
