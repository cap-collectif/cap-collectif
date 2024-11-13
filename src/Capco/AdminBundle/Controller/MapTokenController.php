<?php

namespace Capco\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class MapTokenController extends AbstractController
{
    /**
     * @Route("admin/map/list", name="capco_admin_map_list_list")
     * @Template("@CapcoAdmin/Map/list.html.twig")
     */
    public function listAction()
    {
        return [];
    }
}
