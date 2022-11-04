<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class MediaAdminController extends AbstractController
{
    public function listAction(): Response
    {
        return $this->render('CapcoMediaBundle:MediaAdmin:list.html.twig');
    }
}
