<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AlphaProjectController extends CRUDController
{
    public function createProposalAction(string $stepId): Response
    {
        /** @var Project $project */
        $project = $this->admin->getSubject();
        /** @var ProjectAbstractStep $pStep */
        foreach ($project->getSteps() as $pStep) {
            $step = $pStep->getStep();
            if (!$step) {
                throw $this->createAccessDeniedException();
            }
            $stepEqualSelectedStep = $step->getId() === $stepId;
            $stepIsNotCollectStep = $stepEqualSelectedStep && !$step->isCollectStep();
            if ($stepIsNotCollectStep) {
                throw $this->createAccessDeniedException();
            }
            $collectStepDontHaveProposalForm =
                $step->isCollectStep() && $stepEqualSelectedStep && !$step->getProposalForm();
            if ($collectStepDontHaveProposalForm) {
                throw $this->createAccessDeniedException();
            }
        }
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams(
            'CapcoAdminBundle:AlphaProject:createProposal.html.twig',
            [
                'object' => $this->admin->getSubject(),
                'form' => $this->admin->getForm()->createView(),
                'action' => 'create',
                'stepId' => $stepId,
            ]
        );
    }

    public function editAnalysisAction(): Response
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editContributorsAction()
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editProposalsAction()
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editQuestionnaireRepliesAction()
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function indexProposalsAction()
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editParticipantsAction()
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editDebateAction(string $slug)
    {
        $this->throwIfNoAccess();
        /** @var Project $project */
        $project = $this->admin->getSubject();
        $matching = $project
            ->getSteps()
            ->map(fn(ProjectAbstractStep $pas) => $pas->getStep())
            ->matching(AbstractStepRepository::createSlugCriteria($slug));
        if (0 === $matching->count()) {
            throw $this->createNotFoundException();
        }

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editAction(Request $request): Response
    {
        if (!$this->isGranted(ProjectVoter::EDIT, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }

        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    private function throwIfNoAccess()
    {
        if (!$this->isGranted(ProjectVoter::VIEW, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }
    }
}
