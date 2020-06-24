<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\PageTranslation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * @Route("/pages")
 */
class PageController extends Controller
{
    private SiteParameterRepository $siteParameterRepository;
    private TranslatorInterface $translator;

    public function __construct(
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        $this->siteParameterRepository = $siteParameterRepository;
        $this->translator = $translator;
    }

    /**
     * @Route("/{slug}", name="app_page_show", options={"i18n" = true})
     * @Entity("pageTranslation", class="CapcoAppBundle:PageTranslation", options={"mapping": {"slug": "slug"}})
     * @Template("CapcoAppBundle:Page:show.html.twig")
     */
    public function showAction(Request $request, ?PageTranslation $pageTranslation = null)
    {
        $slugCharter = strtolower($this->translator->trans('charter', [], 'CapcoAppBundle'));

        if (null === $pageTranslation && $request->get('slug') === $slugCharter) {
            $body = $this->siteParameterRepository->getValue('charter.body', $request->getLocale());
            if (null === $body) {
                throw $this->createNotFoundException(
                    $this->translator->trans('page.error.not_found', [], 'CapcoAppBundle')
                );
            }

            return $this->render('CapcoAppBundle:Page:charter.html.twig', ['body' => $body]);
        }

        if (!$pageTranslation) {
            throw $this->createNotFoundException(
                $this->translator->trans('page.error.not_found', [], 'CapcoAppBundle')
            );
        }

        $page = $pageTranslation->getTranslatable();

        if (!$page->getIsEnabled()) {
            throw $this->createNotFoundException(
                $this->translator->trans('page.error.not_found', [], 'CapcoAppBundle')
            );
        }

        return [
            'page' => $page,
            'pageTranslation' => $pageTranslation,
        ];
    }
}
