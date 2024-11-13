<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class EmailingListController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction(Request $request): Response
    {
        return $this->renderWithExtraParams('@CapcoAdmin/Emailing/emailingList.html.twig');
    }
}
