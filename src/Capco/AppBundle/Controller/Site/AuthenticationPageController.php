<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class AuthenticationPageController extends Controller
{
    /**
     * @Route("/", name="authentication_page")
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Default:authentication_page.html.twig")
     */
    public function authenticationPageAction()
    {
        return [];
    }
}
