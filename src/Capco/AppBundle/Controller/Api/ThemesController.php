<?php

namespace Capco\AppBundle\Controller\Api;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;

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
     * @View(statusCode=200, serializerGroups={"Themes"})
     *
     * @return array
     */
    public function getThemesAction()
    {
        $em = $this->getDoctrine()->getManager();
        $themes = $em->getRepository('CapcoAppBundle:Theme')->findAll();

        return $themes;
    }
}
