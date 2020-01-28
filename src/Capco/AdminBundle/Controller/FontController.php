<?php

namespace Capco\AdminBundle\Controller;

class FontController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Font:list.html.twig');
    }
}
