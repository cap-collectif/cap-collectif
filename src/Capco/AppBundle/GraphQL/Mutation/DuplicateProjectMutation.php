<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Translation\TranslatorInterface;

class DuplicateProjectMutation implements MutationInterface
{
    private TranslatorInterface $translator;
    private EntityManagerInterface $entityManager;

    private array $cloneStatusReferences;
    private array $cloneStepReferences;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        TranslatorInterface $translator,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->translator = $translator;
        $this->entityManager = $entityManager;
        $this->cloneStatusReferences = [];
        $this->cloneStepReferences = [];
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer)
    {
        $projectId = $input->offsetGet('id');
        $project = $this->globalIdResolver->resolve($projectId, $viewer);
        if (!$project) {
            throw new UserError('This project does not exist.');
        }

        $clonedProject = clone $project;
        $clonedProject->setTitle($this->translator->trans('copy-of') . ' ' . $project->getTitle());
        $clonedProject->setSlug('copy-of-' . $project->getSlug());

        /** @var ProjectAuthor $author */
        foreach ($project->getAuthors() as $author) {
            $clonedProjectAuthor = clone $author;
            $clonedProjectAuthor->setProject($clonedProject);
            $clonedProject->addAuthor($clonedProjectAuthor);
        }

        foreach ($project->getThemes() as $theme) {
            $clonedProject->addTheme($theme);
        }

        $clonedProject->resetSteps();
        foreach ($project->getSteps() as $abstractStep) {
            $clonedAbstractStep = $this->getStepCloneReference($abstractStep, $clonedProject);
            $step = $abstractStep->getStep();
            /** @var Status $status */
            foreach ($step->getStatuses() as $status) {
                $this->getStatusCloneReference($status, $clonedAbstractStep, $step->getId());
            }
            if (method_exists($step, 'getDefaultStatus') && null !== $step->getDefaultStatus()) {
                $clonedAbstractStep
                    ->getStep()
                    ->setDefaultStatus(
                        $this->getStatusCloneReference(
                            $step->getDefaultStatus(),
                            $clonedAbstractStep,
                            $step->getId()
                        )
                    )
                ;
            }

            if ($step instanceof CollectStep && ($proposalForm = $step->getProposalForm())) {
                $clonedProposalForm = $clonedAbstractStep->getStep()->getProposalForm();
                $clonedProposalForm->setTitle(
                    $this->translator->trans('copy-of') . ' ' . $proposalForm->getTitle()
                );

                if ($proposalAnalysisConfiguration = $proposalForm->getAnalysisConfiguration()) {
                    /** @var AnalysisConfiguration $clonedAnalysisConfiguration */
                    $clonedAnalysisConfiguration = $clonedAbstractStep
                        ->getStep()
                        ->getProposalForm()
                        ->getAnalysisConfiguration()
                    ;

                    if ($proposalAnalysisConfiguration->getEvaluationForm()) {
                        $this->cloneQuestionnaireNotificationConfiguration(
                            $proposalAnalysisConfiguration->getEvaluationForm(),
                            $clonedAnalysisConfiguration->getEvaluationForm()
                        );
                    }

                    if ($proposalAnalysisConfiguration->getSelectionStepStatus()) {
                        $clonedAnalysisConfiguration->setSelectionStepStatus(
                            $this->getStatusCloneReference(
                                $proposalAnalysisConfiguration->getSelectionStepStatus(),
                                $clonedAbstractStep,
                                $step->getId()
                            )
                        );
                    }

                    if (
                        $analysisConfigFavourableStatus = $proposalAnalysisConfiguration->getFavourableStatus()
                    ) {
                        $clonedAnalysisConfiguration->setFavourableStatus(
                            $this->getStatusCloneReference(
                                $analysisConfigFavourableStatus,
                                $clonedAbstractStep,
                                $step->getId()
                            )
                        );
                    }
                    if ($selectionStep = $proposalAnalysisConfiguration->getMoveToSelectionStep()) {
                        /** @var SelectionStep $clonedSelectionStep */
                        $clonedSelectionStep = $this->getStepCloneReference(
                            $selectionStep->getProjectAbstractStep(),
                            $clonedProject
                        )->getStep();
                        $clonedAnalysisConfiguration->setMoveToSelectionStep($clonedSelectionStep);
                    }
                    foreach (
                        $proposalAnalysisConfiguration->getUnfavourableStatuses()
                        as $unfavourableStatus
                    ) {
                        $clonedUnfavourableStatus = $this->getStatusCloneReference(
                            $unfavourableStatus,
                            $clonedAbstractStep,
                            $step->getId()
                        );
                        $clonedAnalysisConfiguration->addUnfavourableStatus(
                            $clonedUnfavourableStatus
                        );
                    }
                }

                if ($clonedEvaluationForm = $clonedProposalForm->getEvaluationForm()) {
                    $clonedEvaluationForm->setTitle(
                        $this->translator->trans('copy-of') .
                            ' ' .
                            $clonedEvaluationForm->getTitle()
                    );
                    $this->cloneQuestionnaireNotificationConfiguration(
                        $proposalForm->getEvaluationForm(),
                        $clonedEvaluationForm
                    );
                }
            }

            if (
                $project->getFirstAnalysisStep()
                && $project->getFirstAnalysisStep()->getId() === $step->getId()
            ) {
                $clonedAbstractStep
                    ->getStep()
                    ->getProposalForm()
                    ->getAnalysisConfiguration()
                    ->setAnalysisStep($clonedAbstractStep->getStep())
                ;
            }

            $clonedProject->addStep($clonedAbstractStep);
        }

        $this->entityManager->persist($clonedProject);
        $this->entityManager->flush();

        return ['oldProject' => $project, 'newProject' => $clonedProject];
    }

    public function isGranted(string $projectId, User $viewer): bool
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        return $this->authorizationChecker->isGranted(ProjectVoter::DUPLICATE, $project);
    }

    private function cloneQuestionnaireNotificationConfiguration(
        Questionnaire $originalQuestionnaire,
        Questionnaire $clonedQuestionnaire
    ) {
        $notificationsConfiguration = $originalQuestionnaire->getNotificationsConfiguration();

        $newNotificationsConfiguration = (new QuestionnaireNotificationConfiguration())
            ->setOnQuestionnaireReplyUpdate(
                $notificationsConfiguration->isOnQuestionnaireReplyUpdate()
            )
            ->setOnQuestionnaireReplyCreate(
                $notificationsConfiguration->isOnQuestionnaireReplyCreate()
            )
            ->setOnQuestionnaireReplyDelete(
                $notificationsConfiguration->isOnQuestionnaireReplyDelete()
            )
            ->setEmail($notificationsConfiguration->getEmail())
            ->setQuestionnaire($clonedQuestionnaire)
        ;

        $clonedQuestionnaire->setNotificationsConfiguration($newNotificationsConfiguration);
    }

    private function getStatusCloneReference(
        Status $status,
        ProjectAbstractStep $clonedAbstractStep,
        string $refererId
    ): Status {
        if (
            \array_key_exists(
                $status->getName() . '-' . $status->getColor() . '-' . $refererId,
                $this->cloneStatusReferences
            )
        ) {
            return $this->cloneStatusReferences[
                $status->getName() . '-' . $status->getColor() . '-' . $refererId
            ];
        }

        $clonedStatus = clone $status;
        $clonedStatus->setStep(
            $this->getStepCloneReference(
                $clonedStatus->getStep()->getProjectAbstractStep(),
                $clonedAbstractStep->getProject()
            )->getStep()
        );
        $clonedAbstractStep->getStep()->addStatus($clonedStatus);
        $this->cloneStatusReferences[
            $status->getName() . '-' . $status->getColor() . '-' . $refererId
        ] = $clonedStatus;

        return $clonedStatus;
    }

    private function getStepCloneReference(
        ProjectAbstractStep $abstractStep,
        Project $clonedProject
    ): ProjectAbstractStep {
        if (\array_key_exists($abstractStep->getStep()->getTitle(), $this->cloneStepReferences)) {
            return $this->cloneStepReferences[$abstractStep->getStep()->getTitle()];
        }

        $clonedAbstractStep = clone $abstractStep;
        $clonedAbstractStep->setProject($clonedProject);
        $this->cloneStepReferences[$abstractStep->getStep()->getTitle()] = $clonedAbstractStep;

        return $clonedAbstractStep;
    }
}
