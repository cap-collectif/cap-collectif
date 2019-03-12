<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\SiteParameter\Resolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/**
 * @Route("/pages")
 */
class PageController extends Controller
{
    /**
     * @Route("/{slug}", name="app_page_show")
     * @ParamConverter("page", class="CapcoAppBundle:Page", options={"mapping": {"slug": "slug"}})
     * @Template("CapcoAppBundle:Page:show.html.twig")
     */
    public function showAction(Request $request, Page $page = null)
    {
        $slugCharter = strtolower($this->get('translator')->trans('charter', [], 'CapcoAppBundle'));

        if (null === $page && $request->get('slug') === $slugCharter) {
            $body = $this->container->get(Resolver::class)->getValue('charter.body');

            if (null === $body) {
                throw $this->createNotFoundException(
                    $this->get('translator')->trans('page.error.not_found', [], 'CapcoAppBundle')
                );
            }

            return $this->render('CapcoAppBundle:Page:charter.html.twig', ['body' => $body]);
        }

        if (null !== $page && !$page->getIsEnabled()) {
            throw $this->createNotFoundException(
                $this->get('translator')->trans('page.error.not_found', [], 'CapcoAppBundle')
            );
        }

        return [
            'page' => $page,
        ];
    }
}
