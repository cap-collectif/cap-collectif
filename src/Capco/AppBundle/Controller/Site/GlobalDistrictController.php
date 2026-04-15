<?php

namespace Capco\AppBundle\Controller\Site;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class GlobalDistrictController extends Controller
{
    /**
     * @Route("/project-district/{slug}", name="app_project_district_show", options={"i18n" = false})
     * @Template("@CapcoApp/GlobalDistrict/show.html.twig")
     */
    public function showAction(string $slug): Response
    {
        // District pages are rendered by Next.js. Symfony keeps the route only
        // to preserve URL generation before handing off.
        return new Response('', Response::HTTP_I_AM_A_TEAPOT);
    }
}
