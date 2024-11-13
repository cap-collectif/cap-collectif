<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Security\QuestionnaireVoter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class QuestionnaireController extends CRUDController
{
    public function editAction(Request $request): Response
    {
        $this->throwIfNoAccess();

        return $this->renderWithExtraParams('@CapcoAdmin/Questionnaire/edit.html.twig', [
            'object' => $this->admin->getSubject(),
            'form' => $this->admin->getForm()->createView(),
            'action' => 'edit',
        ]);
    }

    private function throwIfNoAccess()
    {
        if (!$this->isGranted(QuestionnaireVoter::EDIT, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }
    }
}
