<?php

namespace Capco\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class NewsController extends Controller
{
    /**
     * @Route("/news/{page}", name="app_news", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Template()
     */
    public function indexAction()
    {
        return array(
            // ...
        );
    }
}
