<?php

namespace Capco\AdminBundle\Controller;

class EmailingController extends \Sonata\AdminBundle\Controller\CRUDController
{

    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Emailing:emailingList.html.twig');
    }
}
