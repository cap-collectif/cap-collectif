<?php

namespace Capco\AppBundle\Controller\Api;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\Util\Codes;
use Symfony\Component\HttpFoundation\Request;

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
     * @return array
     */
    public function getThemesAction()
    {
        $em = $this->getDoctrine()->getManager();
        $themes = $em->getRepository('CapcoAppBundle:Theme')->findAll();

        return $themes;
    }
}
