<?php

namespace Capco\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class SiteFaviconController extends AbstractController
{
    /**
     * @Route("admin/favicon/list", name="capco_admin_site_favicon_list")
     * @Template("@CapcoAdmin/SiteFavicon/list.html.twig")
     */
    public function listAction()
    {
        return [];
    }
}
