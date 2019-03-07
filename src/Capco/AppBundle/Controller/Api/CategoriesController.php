<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;

class CategoriesController extends FOSRestController
{
    /**
     * @Get("/categories")
     * @View(serializerGroups={"Categories"})
     */
    public function getCategoriesAction()
    {
        $categories = $this->get('capco.category.repository')->findBy(['isEnabled' => true]);

        return $categories;
    }
}
