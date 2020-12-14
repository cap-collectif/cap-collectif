<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\AbstractStepRepository;

class AlphaProjectController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function editAnalysisAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editContributorsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editProposalsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function indexProposalsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editParticipantsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    public function editDebateAction(string $slug)
    {
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
}
