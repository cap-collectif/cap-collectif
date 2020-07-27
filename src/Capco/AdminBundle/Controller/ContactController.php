<?php

namespace Capco\AdminBundle\Controller;

class ContactController extends CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Contact:list.html.twig', [
            'action' => 'list',
        ]);
    }
}
