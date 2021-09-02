<?php

namespace Capco\AdminBundle\Controller;

class EmailingListController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Emailing:emailingList.html.twig');
    }
}
