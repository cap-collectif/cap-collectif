<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Page;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;

/**
 * @Route("/pages")
 */
class PageController extends Controller
{
    /**
     * @Route("/{slug}", name="app_page_show")
     * @ParamConverter("page", class="CapcoAppBundle:Page", options={"mapping": {"slug": "slug"}})
     * @Template("CapcoAppBundle:Page:show.html.twig")
     *
     * @param Page $page
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
