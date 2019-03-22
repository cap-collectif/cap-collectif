<?php

namespace Capco\AdminBundle\Controller;

class ContactController extends CRUDController
{
    public function listAction()
    {
        return $this->render('CapcoAdminBundle:Contact:list.html.twig');
    }
}
