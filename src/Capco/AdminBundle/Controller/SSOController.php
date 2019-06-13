<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

class SSOController extends CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:SSO:list.html.twig');
    }
}
