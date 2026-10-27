<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class EmailingListController extends CRUDController
{
    public function listAction(Request $request): Response
    {
        return $this->renderWithExtraParams('@CapcoAdmin/Emailing/emailingList.html.twig');
    }
}
