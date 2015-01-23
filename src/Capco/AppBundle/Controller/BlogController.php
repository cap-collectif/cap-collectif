<?php

namespace Capco\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

class BlogController extends Controller
{
    /**
     * @Route("/blog", name="app_blog", defaults={"_feature_flag" = "blog"} )
     * @Template()
     * @param $request
     * @return array
     */
    public function indexAction(Request $request)
    {
        return [];
    }
}
