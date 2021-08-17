<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Security\QuestionnaireVoter;

class QuestionnaireController extends CRUDController
{
    public function editAction($id = null)
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('CapcoAdminBundle:Questionnaire:edit.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    private function throwIfNoAccess()
    {
        if (!$this->isGranted(QuestionnaireVoter::VIEW, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }
    }
}
