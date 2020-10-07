<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Translation\TranslatorInterface;

class DuplicateProjectMutation implements MutationInterface
{
    private ProjectRepository $projectRepository;
    private TranslatorInterface $translator;
    private EntityManagerInterface $entityManager;

    private array $cloneStatusReferences;
    private array $cloneStepReferences;

    public function __construct(
        ProjectRepository $projectRepository,
        TranslatorInterface $translator,
        EntityManagerInterface $entityManager
    ) {
        $this->projectRepository = $projectRepository;
        $this->translator = $translator;
        $this->entityManager = $entityManager;
        $this->cloneStatusReferences = [];
        $this->cloneStepReferences = [];
    }

    public function __invoke(Argument $input)
    {
        $arguments = $input->getArrayCopy();
        $projectId = $input->offsetGet('id');
        $project = $this->projectRepository->find($projectId);
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
                $this->getStatusCloneReference($status, $clonedAbstractStep);
            }

            if ($step instanceof CollectStep && ($proposalForm = $step->getProposalForm())) {
                if ($step->getDefaultStatus()) {
                    $clonedDefaultStatus = clone $step->getDefaultStatus();
                    $clonedDefaultStatus->setStep($clonedAbstractStep->getStep());
                }
                $clonedProposalForm = $clonedAbstractStep->getStep()->getProposalForm();
                $clonedProposalForm->setTitle(
                    $this->translator->trans('copy-of') . ' ' . $proposalForm->getTitle()
                );

                if ($proposalAnalysisConfiguration = $proposalForm->getAnalysisConfiguration()) {
                    /** @var AnalysisConfiguration $clonedAnalysisConfiguration */
                    $clonedAnalysisConfiguration = $clonedAbstractStep
                        ->getStep()
                        ->getProposalForm()
                        ->getAnalysisConfiguration();
                    if ($proposalAnalysisConfiguration->getSelectionStepStatus()) {
                        $clonedAnalysisConfiguration->setSelectionStepStatus(
                            $this->getStatusCloneReference(
                                $proposalAnalysisConfiguration->getSelectionStepStatus(),
                                $clonedAbstractStep
                            )
                        );
                    }

                    if (
                        $analysisConfigFavourableStatus = $proposalAnalysisConfiguration->getFavourableStatus()
                    ) {
                        $clonedAnalysisConfiguration->setFavourableStatus(
                            $this->getStatusCloneReference(
                                $analysisConfigFavourableStatus,
                                $clonedAbstractStep
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
                            $clonedAbstractStep
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
                }
            }

            if (
                $project->getFirstAnalysisStep() &&
                $project->getFirstAnalysisStep()->getId() === $step->getId()
            ) {
                $clonedAbstractStep
                    ->getStep()
                    ->getProposalForm()
                    ->getAnalysisConfiguration()
                    ->setAnalysisStep($clonedAbstractStep->getStep());
            }

            $clonedProject->addStep($clonedAbstractStep);
        }

        $this->entityManager->persist($clonedProject);
        $this->entityManager->flush();

        return ['oldProject' => $project, 'newProject' => $clonedProject];
    }

    private function getStatusCloneReference(
        Status $status,
        ProjectAbstractStep $clonedAbstractStep
    ): Status {
        if (\array_key_exists($status->getName(), $this->cloneStatusReferences)) {
            return $this->cloneStatusReferences[$status->getName()];
        }

        $clonedStatus = clone $status;
        $clonedStatus->setStep(
            $this->getStepCloneReference(
                $clonedStatus->getStep()->getProjectAbstractStep(),
                $clonedAbstractStep->getProject()
            )->getStep()
        );
        $this->cloneStatusReferences[$status->getName()] = $clonedStatus;

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
