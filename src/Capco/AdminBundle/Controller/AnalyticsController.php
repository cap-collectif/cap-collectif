<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Response;

class AnalyticsController extends Controller
{
    public function listAction(): Response
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Analytics:analytics.html.twig');
    }
}
