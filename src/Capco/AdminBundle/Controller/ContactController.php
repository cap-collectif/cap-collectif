<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ContactController extends CRUDController
{
    public function listAction(Request $request): Response
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Contact:list.html.twig', [
            'action' => 'list',
        ]);
    }
}
