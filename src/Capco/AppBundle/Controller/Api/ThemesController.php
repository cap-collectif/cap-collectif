<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;

class ThemesController extends FOSRestController
{
    /**
     * Get themes.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get themes",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when themes are not found",
     *  }
     * )
     *
     * @Get("/themes")
     * @View(statusCode=200, serializerGroups={"ThemeDetails"})
     *
     * @return array
     */
    public function getThemesAction()
    {
        $themes = $this->get('capco.theme.repository')->findAll();

        return $themes;
    }
}
