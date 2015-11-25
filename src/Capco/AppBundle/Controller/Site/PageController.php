<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Page;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

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
     *
     * @return array
     */
    public function showAction(Page $page)
    {
        if ($page->getIsEnabled() == false) {
            throw $this->createNotFoundException($this->get('translator')->trans('page.error.not_found', array(), 'CapcoAppBundle'));
        }

        $response = $this->render('CapcoAppBundle:Page:show.html.twig', array(
            'page' => $page,
        ));

        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_ANONYMOUSLY')) {
            $response->setPublic();
            $response->setSharedMaxAge(60);
        }

        return $response;
    }
}
