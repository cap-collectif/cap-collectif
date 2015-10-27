<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;

class FeaturesController extends FOSRestController
{
    /**
     * @Get("/features")
     */
    public function cgetAction()
    {
        $data = $this->get('capco.toggle.manager')->all();
        $view = $this->view($data, 200);
        $response = $this->handleView($view);
        $response->setPublic();
        $response->setSharedMaxAge(60);

        return $response;
    }
}
