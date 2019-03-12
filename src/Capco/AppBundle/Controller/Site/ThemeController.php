<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\ThemeSearchType;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class ThemeController extends Controller
{
    /**
     * @Route("/themes/{page}", name="app_theme", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "themes"} )
     * @Route("/themes/search/{term}/{page}", name="app_theme_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "themes"} )
     * @Template("CapcoAppBundle:Theme:index.html.twig")
     *
     * @param mixed      $page
     * @param null|mixed $term
     */
    public function indexAction(Request $request, $page, $term = null)
    {
        $currentUrl = $this->generateUrl('app_theme');

        $form = $this->createForm(ThemeSearchType::class, null, [
            'action' => $currentUrl,
            'method' => 'POST',
        ]);

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect(
                    $this->generateUrl('app_theme_search', ['term' => $data['term']])
                );
            }
        } else {
            $form->setData(['term' => $term]);
        }

        $pagination = $this->get(Resolver::class)->getValue('themes.pagination');

        $themes = $this->get(ThemeRepository::class)->getSearchResultsWithCounters(
            $pagination,
            $page,
            $term
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 > $pagination && 0 !== \count($themes)) {
            $nbPage = ceil(\count($themes) / $pagination);
        }

        return [
            'themes' => $themes,
            'form' => $form->createView(),
            'page' => $page,
            'nbPage' => $nbPage,
        ];
    }

    /**
     * @Route("/themes/{slug}", name="app_theme_show", defaults={"_feature_flags" = "themes"})
     * @ParamConverter("theme", class="CapcoAppBundle:Theme", options={"mapping": {"slug": "slug"}, "repository_method" = "getOneBySlug", "map_method_signature" = true})
     * @Template("CapcoAppBundle:Theme:show.html.twig")
     */
    public function showAction(Theme $theme)
    {
        if (!$theme->canDisplay()) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('restricted-access', [], 'CapcoAppBundle')
            );
        }

        return [
            'theme' => $theme,
            'themeId' => $theme->getId(),
            'max' => 12,
        ];
    }
}
