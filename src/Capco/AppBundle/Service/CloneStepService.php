<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\Interfaces\DefaultStatusInterface;
use Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CloneStepService
{
    public const COPY_TITLE_PREFIX = 'copy-of';
    private EntityManagerInterface $entityManager;
    private TranslatorInterface $translator;

    /**
     * @var array<string, Status>
     */
    private array $statusCloneCache;

    /**
     * @var array<string, ProjectAbstractStep>
     */
    private array $stepCloneCache;

    public function __construct(
        EntityManagerInterface $entityManager,
        TranslatorInterface $translator
    ) {
        $this->entityManager = $entityManager;
        $this->translator = $translator;
        $this->statusCloneCache = [];
        $this->stepCloneCache = [];
    }

    public function cloneProject(Project $originalProject): Project
    {
        $clonedProject = $this->getClonedProject($originalProject);
        $this->cloneProjectAuthors($originalProject, $clonedProject);
        $this->cloneThemes($originalProject, $clonedProject);

        $clonedProject->resetSteps();

        foreach ($originalProject->getSteps() as $originalAbstractStep) {
            $clonedAbstractStep = $this->cloneAbstractStep($originalAbstractStep, $clonedProject, $originalProject);
            $clonedProject->addStep($clonedAbstractStep);
        }

        $this->entityManager->persist($clonedProject);
        $this->entityManager->flush();

        return $clonedProject;
    }

    private function cloneProjectAuthors(Project $originalProject, Project $clonedProject): void
    {
        foreach ($originalProject->getAuthors() as $author) {
            $clonedAuthor = clone $author;
            $clonedAuthor->setProject($clonedProject);
            $clonedProject->addAuthor($clonedAuthor);
        }
    }

    private function cloneThemes(Project $originalProject, Project $clonedProject): void
    {
        foreach ($originalProject->getThemes() as $theme) {
            $clonedProject->addTheme($theme);
        }
    }

    private function cloneAbstractStep(
        ProjectAbstractStep $originalAbstractStep,
        Project $clonedProject,
        Project $originalProject
    ): ProjectAbstractStep {
        $clonedAbstractStep = $this->getOrCloneStep($originalAbstractStep, $clonedProject);

        /** @var AbstractStep $originalStep */
        $originalStep = $originalAbstractStep->getStep();
        $clonedStep = $clonedAbstractStep->getStep();

        $this->cloneStepStatus($originalStep, $clonedAbstractStep, $clonedStep);

        if ($originalStep instanceof CollectStep && ($originalProposalForm = $originalStep->getProposalForm())) {
            $this->cloneAndConfigureCollectStep($clonedAbstractStep, $originalProposalForm, $originalStep, $clonedProject);
        }

        $this->configureFirstAnalysisStep($originalProject, $originalStep, $clonedAbstractStep);

        return $clonedAbstractStep;
    }

    private function cloneStepStatus(
        AbstractStep $originalStep,
        ProjectAbstractStep $clonedAbstractStep,
        ?AbstractStep $clonedStep
    ): void {
        /** @var Status $status */
        foreach ($originalStep->getStatuses() as $status) {
            $this->getOrCloneStatus($status, $clonedAbstractStep, $originalStep->getId());
        }

        if ($originalStep instanceof DefaultStatusInterface && null !== $originalStep->getDefaultStatus()) {
            $clonedStep->setDefaultStatus(
                $this->getOrCloneStatus(
                    $originalStep->getDefaultStatus(),
                    $clonedAbstractStep,
                    $originalStep->getId()
                )
            );
        }
    }

    private function cloneAndConfigureCollectStep(
        ProjectAbstractStep $clonedAbstractStep,
        ProposalForm $proposalForm,
        AbstractStep $originalStep,
        Project $clonedProject
    ): void {
        $clonedProposalForm = $clonedAbstractStep->getStep()->getProposalForm();
        $proposalFormTitle = $proposalForm->getTitle();

        $clonedProposalForm->setTitle(
            sprintf('%s %s', $this->translator->trans(self::COPY_TITLE_PREFIX), $proposalFormTitle)
        );

        $clonedEvaluationForm = $clonedProposalForm->getEvaluationForm();
        if ($clonedEvaluationForm) {
            $clonedEvaluationForm->setTitle(
                sprintf('%s %s', $this->translator->trans(self::COPY_TITLE_PREFIX), $proposalFormTitle)
            );
            $this->cloneQuestionnaireNotificationConfiguration(
                $proposalForm->getEvaluationForm(),
                $clonedEvaluationForm
            );
        }

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
                    $this->getOrCloneStatus(
                        $proposalAnalysisConfiguration->getSelectionStepStatus(),
                        $clonedAbstractStep,
                        $originalStep->getId()
                    )
                );
            }

            if (
                $analysisConfigFavourableStatus = $proposalAnalysisConfiguration->getFavourableStatus()
            ) {
                $clonedAnalysisConfiguration->setFavourableStatus(
                    $this->getOrCloneStatus(
                        $analysisConfigFavourableStatus,
                        $clonedAbstractStep,
                        $originalStep->getId()
                    )
                );
            }
            if ($selectionStep = $proposalAnalysisConfiguration->getMoveToSelectionStep()) {
                /** @var SelectionStep $clonedSelectionStep */
                $clonedSelectionStep = $this->getOrCloneStep(
                    $selectionStep->getProjectAbstractStep(),
                    $clonedProject
                )->getStep();
                $clonedAnalysisConfiguration->setMoveToSelectionStep($clonedSelectionStep);
            }
            foreach (
                $proposalAnalysisConfiguration->getUnfavourableStatuses()
                as $unfavourableStatus
            ) {
                $clonedUnfavourableStatus = $this->getOrCloneStatus(
                    $unfavourableStatus,
                    $clonedAbstractStep,
                    $originalStep->getId()
                );
                $clonedAnalysisConfiguration->addUnfavourableStatus(
                    $clonedUnfavourableStatus
                );
            }
        }
    }

    private function configureFirstAnalysisStep(
        Project $originalProject,
        AbstractStep $originalStep,
        ProjectAbstractStep $clonedAbstractStep
    ): void {
        if (
            $originalProject->getFirstAnalysisStep()
            && $originalProject->getFirstAnalysisStep()->getId() === $originalStep->getId()
        ) {
            $clonedAbstractStep
                ->getStep()
                ->getProposalForm()
                ->getAnalysisConfiguration()
                ->setAnalysisStep($clonedAbstractStep->getStep())
            ;
        }
    }

    private function getClonedProject(Project $originalProject): Project
    {
        $clonedProject = clone $originalProject;
        $clonedProject->setTitle($this->translator->trans(self::COPY_TITLE_PREFIX) . ' ' . $originalProject->getTitle());
        $clonedProject->setSlug(self::COPY_TITLE_PREFIX . '-' . $originalProject->getSlug());

        return $clonedProject;
    }

    private function cloneQuestionnaireNotificationConfiguration(
        Questionnaire $originalQuestionnaire,
        Questionnaire $clonedQuestionnaire
    ): void {
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

    private function getOrCloneStatus(
        Status $status,
        ProjectAbstractStep $clonedAbstractStep,
        string $stepId
    ): Status {
        $cacheKey = $this->buildStatusCacheKey($status, $stepId);

        if (\array_key_exists($cacheKey, $this->statusCloneCache)) {
            return $this->statusCloneCache[$cacheKey];
        }

        $clonedStatus = clone $status;
        $clonedStatus->setStep(
            $this->getOrCloneStep(
                $clonedStatus->getStep()->getProjectAbstractStep(),
                $clonedAbstractStep->getProject()
            )->getStep()
        );
        $clonedAbstractStep->getStep()->addStatus($clonedStatus);
        $this->statusCloneCache[$cacheKey] = $clonedStatus;

        return $clonedStatus;
    }

    private function getOrCloneStep(
        ProjectAbstractStep $abstractStep,
        Project $clonedProject
    ): ProjectAbstractStep {
        $cacheKey = $this->buildStepCacheKey($abstractStep);

        if (\array_key_exists($cacheKey, $this->stepCloneCache)) {
            return $this->stepCloneCache[$cacheKey];
        }

        $clonedAbstractStep = clone $abstractStep;
        $clonedAbstractStep->setProject($clonedProject);
        $this->stepCloneCache[$cacheKey] = $clonedAbstractStep;

        return $clonedAbstractStep;
    }

    private function buildStatusCacheKey(Status $status, string $stepId): string
    {
        return $status->getName() . '-' . $status->getColor() . '-' . $stepId;
    }

    private function buildStepCacheKey(ProjectAbstractStep $abstractStep): string
    {
        return $abstractStep->getId() . '-' . $abstractStep->getStep()->getTitle();
    }
}
