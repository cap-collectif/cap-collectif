<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Page;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * @Route("/pages")
 */
class PageController extends Controller
{
    /**
     * @Route("/{slug}", name="app_page_show")
     * @ParamConverter("page", class="CapcoAppBundle:Page", options={"mapping": {"slug": "slug"}})
     * @Template("CapcoAppBundle:Page:show.html.twig")
     * @Cache(smaxage=60, public=true)
     */
    public function showAction(Page $page)
    {
        if (!$page->getIsEnabled()) {
            throw $this->createNotFoundException($this->get('translator')->trans('page.error.not_found', [], 'CapcoAppBundle'));
        }

        return [
            'page' => $page,
        ];
    }
}
