<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Repository\SourceCategoryRepository;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;

class SourceCategoriesController extends AbstractFOSRestController
{
    /**
     * @Get("/sourcecategories")
     * @View(serializerGroups={"Categories"})
     */
    public function getSourceCategoriesAction()
    {
        return $this->get(SourceCategoryRepository::class)->findBy(['isEnabled' => true]);
    }
}
