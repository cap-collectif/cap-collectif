<?php

namespace Capco\AppBundle\Controller\Site;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ContactController extends Controller
{
    /**
     * @Route("/contact", name="app_contact")
     * @Template("@CapcoApp/Contact/list.html.twig")
     */
    public function contactAction(): Response
    {
        // The contact page is rendered by Next.js. Symfony keeps the route only
        // to preserve URL generation before handing off.
        return new Response('', Response::HTTP_I_AM_A_TEAPOT);
    }
}
