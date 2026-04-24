<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/pages")
 */
class PageController extends Controller
{
    /**
     * @Route("/{slug}", name="app_page_show", options={"i18n" = true})
     */
    public function showAction(): Response
    {
        // Symfony still owns this route so the rest of the app can generate
        // locale-aware /pages/{slug} URLs. nginx then forwards this 418
        // response to the public Next.js app, which renders the page.
        return new Response('', Response::HTTP_I_AM_A_TEAPOT);
    }
}
