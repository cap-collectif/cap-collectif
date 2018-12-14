<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\ThemeSearchType;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
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

        $themes = $this->get('capco.theme.repository')->getSearchResultsWithCounters(
            $pagination,
            $page,
            $term
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 !== $pagination) {
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

        $serializer = $this->get('serializer');

        $projectProps = $serializer->serialize(
            [
                'projects' => $this->get(
                    'Capco\AppBundle\Repository\ProjectRepository'
                )->getProjectsByTheme($theme, $this->getUser()),
            ],
            'json',
            SerializationContext::create()->setGroups([
                'Projects',
                'UserDetails',
                'Steps',
                'Themes',
                'ProjectType',
            ])
        );

        $ideaCreationProps = $serializer->serialize(
            [
                'themes' => $this->get('capco.theme.repository')->findAll(),
                'themeId' => $theme->getId(),
            ],
            'json',
            SerializationContext::create()->setGroups(['ThemeDetails'])
        );

        return [
            'theme' => $theme,
            'maxProjectsDisplayed' => 12,
            'projectProps' => $projectProps,
            'ideaCreationProps' => $ideaCreationProps,
        ];
    }
}
