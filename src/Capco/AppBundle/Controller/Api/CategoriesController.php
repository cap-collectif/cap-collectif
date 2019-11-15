<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Repository\SourceCategoryRepository;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;

class CategoriesController extends AbstractFOSRestController
{
    /**
     * @Get("/categories")
     * @View(serializerGroups={"Categories"})
     */
    public function getCategoriesAction()
    {
        return $this->get(SourceCategoryRepository::class)->findBy(['isEnabled' => true]);
    }
}
