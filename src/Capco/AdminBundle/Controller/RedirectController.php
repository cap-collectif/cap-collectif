<?php

namespace Capco\AdminBundle\Controller;

class RedirectController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:SiteFavicon:list.html.twig');
    }
}
