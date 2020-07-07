<?php

namespace Capco\AdminBundle\Controller;

class AlphaProjectController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function editAnalysisAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit'
        ]);
    }

    public function editContributorsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit'
        ]);
    }

    public function editProposalsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit'
        ]);
    }

    public function editParticipantsAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:AlphaProject:create.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit'
        ]);
    }
}
