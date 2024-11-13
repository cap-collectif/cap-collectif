<?php

namespace Capco\AppBundle\Controller\Site;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ContactController extends Controller
{
    /**
     * @Route("/contact", name="app_contact")
     * @Template("@CapcoApp/Contact/list.html.twig")
     */
    public function contactAction(Request $request)
    {
        return [];
    }
}
