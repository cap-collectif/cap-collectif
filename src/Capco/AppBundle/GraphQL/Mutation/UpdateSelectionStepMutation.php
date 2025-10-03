<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Form\Step\SelectionStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Service\ProposalStepSplitViewService;
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

class UpdateSelectionStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly ProposalStepSplitViewService $proposalStepSplitViewService,
        private readonly ActionLogger $actionLogger
    ) {
    }

    /**
     * @throws GraphQLException
     *
     * @return array<string, bool|SelectionStep>
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $selectionStepId = $input->offsetGet('stepId');
        $selectionStep = $this->getSelectionStep($selectionStepId, $viewer);
        $operationType = $input->offsetGet('operationType');

        unset($data['stepId'], $data['operationType']);

        $form = $this->formFactory->create(SelectionStepFormType::class, $selectionStep);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        $this->actionLogger->logGraphQLMutation(
            $viewer,
            LogActionType::CREATE === $operationType ? LogActionType::CREATE : LogActionType::EDIT,
            sprintf('l\'étape de %s %s du projet %s', $selectionStep->getType(), $selectionStep->getSubType(), $selectionStep->getProject()->getTitle()),
            ConsultationStep::class,
            $selectionStep->getId()
        );

        return [
            'selectionStep' => $selectionStep,
            'proposalStepSplitViewWasDisabled' => $this->proposalStepSplitViewService->proposalStepSplitViewWasDisabled($selectionStep, $data),
        ];
    }

    public function isGranted(string $selectionStepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $selectionStep = $this->getSelectionStep($selectionStepId, $viewer);
        $project = $selectionStep->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    /**
     * @throws UserError
     */
    public function getSelectionStep(string $selectionStepId, User $viewer): SelectionStep
    {
        $selectionStep = $this->globalIdResolver->resolve($selectionStepId, $viewer);
        if (!$selectionStep instanceof SelectionStep) {
            throw new UserError("Given selectionStep id : {$selectionStepId} is not valid");
        }

        return $selectionStep;
    }
}
