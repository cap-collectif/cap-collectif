<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DebugController extends AbstractController
{
    /**
     * @Route("/health", name="health_check", options={"i18n" = false})
     */
    public function health(): Response
    {
        return new JsonResponse([
            "success" => true,
            "message" => 'Instance is alive',
            "data" => [
                "instance" => getenv('SYMFONY_INSTANCE_NAME')
            ]
        ]);
    }
}
