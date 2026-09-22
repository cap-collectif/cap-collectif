<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Form\Step\CollectStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Service\ProposalStepSplitViewService;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateCollectStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly ProposalStepSplitViewService $proposalStepSplitViewService,
        private readonly ActionLogger $actionLogger,
        private readonly HubApiGreenClient $hubApiGreenClient,
        private readonly Manager $toggleManager
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $collectStepId = $input->offsetGet('stepId');
        $operationType = $input->offsetGet('operationType');
        $collectStep = $this->getCollectStep($collectStepId, $viewer);
        $previousStartAt = $collectStep->getStartAt()?->format('Y-m-d H:i:s');
        $previousEndAt = $collectStep->getEndAt()?->format('Y-m-d H:i:s');

        unset($data['stepId'], $data['operationType']);

        $form = $this->formFactory->create(CollectStepFormType::class, $collectStep);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();
        $this->synchronizeHubConsultationDates($collectStep, $previousStartAt, $previousEndAt);

        $this->actionLogger->logGraphQLMutation(
            $viewer,
            LogActionType::CREATE === $operationType ? LogActionType::CREATE : LogActionType::EDIT,
            sprintf('l\'étape %s du projet %s', $collectStep->getTitle(), $collectStep->getProject()->getTitle()),
            CollectStep::class,
            $collectStep->getId()
        );

        return [
            'collectStep' => $collectStep,
            'proposalStepSplitViewWasDisabled' => $this->proposalStepSplitViewService->proposalStepSplitViewWasDisabled($collectStep, $data),
        ];
    }

    public function isGranted(string $collectStepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $collectStep = $this->getCollectStep($collectStepId, $viewer);
        $project = $collectStep->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    public function getCollectStep(string $collectStepId, User $viewer): CollectStep
    {
        $collectStep = $this->globalIdResolver->resolve($collectStepId, $viewer);
        if (!$collectStep instanceof CollectStep) {
            throw new UserError("Given collectStep id : {$collectStepId} is not valid");
        }

        return $collectStep;
    }

    private function synchronizeHubConsultationDates(
        CollectStep $collectStep,
        ?string $previousStartAt,
        ?string $previousEndAt
    ): void {
        $project = $collectStep->getProject();
        $datesChanged = $previousStartAt !== $collectStep->getStartAt()?->format('Y-m-d H:i:s')
            || $previousEndAt !== $collectStep->getEndAt()?->format('Y-m-d H:i:s');
        if (
            !$this->toggleManager->isActive(Manager::hub_api_green)
            || !$datesChanged
            || null === $project
        ) {
            return;
        }

        foreach ($project->getRealSteps() as $projectStep) {
            $hubMetadata = $projectStep->getHubMetadata();
            if (!$hubMetadata?->isEnabled() || !$hubMetadata->isComplete()) {
                continue;
            }

            try {
                $this->hubApiGreenClient->updateConsultationDates($collectStep, $hubMetadata);
            } catch (\RuntimeException $exception) {
                $this->logger->error('Hub API Green consultation dates update failed while updating a collect step.', [
                    'stepId' => $collectStep->getId(),
                    'exception' => $exception,
                ]);

                throw GraphQLException::fromString(
                    'La mise à jour des dates de consultation dans le Hub API Green a échoué. Réessayez.'
                );
            }
        }
    }
}
