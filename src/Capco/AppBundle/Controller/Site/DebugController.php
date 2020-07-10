<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DebugController extends AbstractController
{
    /**
     * @Route("/debug/empty", name="debug_empty", options={"i18n" = false}, condition="'dev' === '%kernel.environment%'")
     */
    public function empty(Request $request): Response
    {
        if ($request->get('twig')) {
            return $this->render('@CapcoApp/empty.html.twig');
        }

        return new Response('Nothing to do here');
    }
}
