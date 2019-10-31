<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Entity\PageTranslation;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

/**
 * @Route("/pages")
 */
class PageController extends Controller
{
    /**
     * @Route("/{slug}", name="app_page_show")
     * @ParamConverter("pageTranslation", class="CapcoAppBundle:PageTranslation", options={"mapping": {"slug": "slug"}})
     * @Template("CapcoAppBundle:Page:show.html.twig")
     */
    public function showAction(Request $request, PageTranslation $pageTranslation = null)
    {
        $slugCharter = strtolower($this->get('translator')->trans('charter', [], 'CapcoAppBundle'));

        if (null === $pageTranslation && $request->get('slug') === $slugCharter) {
            $body = $this->container->get(Resolver::class)->getValue('charter.body');

            if (null === $body) {
                throw $this->createNotFoundException(
                    $this->get('translator')->trans('page.error.not_found', [], 'CapcoAppBundle')
                );
            }

            return $this->render('CapcoAppBundle:Page:charter.html.twig', ['body' => $body]);
        }

        if (!$pageTranslation) {
            throw $this->createNotFoundException(
                $this->get('translator')->trans('page.error.not_found', [], 'CapcoAppBundle')
            );
        }

        $page = $pageTranslation->getTranslatable();
        
        if (!$page->getIsEnabled()) {
            throw $this->createNotFoundException(
                $this->get('translator')->trans('page.error.not_found', [], 'CapcoAppBundle')
            );
        }

        return [
            'page' => $page,
            'pageTranslation' => $pageTranslation,
        ];
    }
}
