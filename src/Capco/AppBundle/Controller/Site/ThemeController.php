<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\ThemeSearchType;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Exception\InvalidParameterException;
use Symfony\Contracts\Translation\TranslatorInterface;

class ThemeController extends Controller
{
    public function __construct(private readonly TranslatorInterface $translator)
    {
    }

    /**
     * @Route("/themes/{page}", name="app_theme", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "themes"} )
     * @Route("/themes/search/{term}/{page}", name="app_theme_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "themes"} )
     * @Template("@CapcoApp/Theme/index.html.twig")
     *
     * @param null|mixed $term
     */
    public function indexAction(Request $request, mixed $page, $term = null)
    {
        $currentUrl = $this->generateUrl('app_theme');

        $form = $this->createForm(ThemeSearchType::class, null, [
            'action' => $currentUrl,
            'method' => 'POST',
        ]);

        if ('POST' === $request->getMethod()) {
            try {
                $form->handleRequest($request);
                if ($form->isValid()) {
                    // redirect to the results page (avoids reload alerts)
                    $data = $form->getData();

                    return $this->redirect(
                        $this->generateUrl('app_theme_search', ['term' => $data['term']])
                    );
                }
            } catch (InvalidParameterException) {
                throw new BadRequestHttpException('Bad Request');
            }
        } else {
            $form->setData(['term' => $term]);
        }

        $pagination = $this->get(SiteParameterResolver::class)->getValue('themes.pagination');

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
     * @Route("/themes/{slug}", name="app_theme_show", defaults={"_feature_flags" = "themes"}, options={"i18n" = false})
     * @Entity("theme", class="CapcoAppBundle:Theme", options={"mapping": {"slug": "slug"}, "repository_method" = "getOneBySlug", "map_method_signature" = true})
     * @Template("@CapcoApp/Theme/show.html.twig")
     */
    public function showAction(Theme $theme)
    {
        if (!$theme->canDisplay()) {
            throw new ProjectAccessDeniedException($this->translator->trans('restricted-access', [], 'CapcoAppBundle'));
        }

        return [
            'theme' => $theme,
            'themeId' => $theme->getId(),
            'max' => 12,
            'archived' => null,
        ];
    }
}
