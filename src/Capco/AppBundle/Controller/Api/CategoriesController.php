<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;

class CategoriesController extends FOSRestController
{
    /**
     * @Get("/categories")
     * @View(serializerGroups={"Categories"})
     */
    public function getCategoriesAction()
    {
        $categories = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:Category')
                      ->findBy(['isEnabled' => true]);

        return $categories;
    }
}
