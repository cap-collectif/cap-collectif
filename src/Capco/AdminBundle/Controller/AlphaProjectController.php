<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AlphaProjectController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function createProposalAction(string $stepId): Response
    {
        /** @var Project $project */
        $project = $this->admin->getSubject();
        if ('project.types.participatoryBudgeting' !== $project->getProjectType()->getTitle()) {
            throw new NotFoundHttpException();
        }

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

    private function throwIfNoAccess()
    {
        if (!$this->isGranted(ProjectVoter::VIEW, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }
    }
}
