<?php

namespace Capco\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class LocaleController extends AbstractController
{
    /**
     * @Route("admin/locale/list", name="capco_admin_locale_list_list", defaults={"_feature_flags" = "multilangue"})
     * @Template("CapcoAdminBundle:Locale:list.html.twig")
     */
    public function listAction()
    {
        return [];
    }
}
