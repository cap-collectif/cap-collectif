<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\ThemeSearchType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;

class ThemeController extends Controller
{
    /**
     * @Route("/themes/{page}", name="app_theme", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flag" = "themes"} )
     * @Route("/themes/search/{term}/{page}", name="app_theme_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flag" = "themes"} )
     * @Template()
     *
     * @param $page
     * @param $request
     * @param $term
     *
     * @return array
     */
    public function indexAction(Request $request, $page, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_theme');

        $form = $this->createForm(new ThemeSearchType(), null, array(
            'action' => $currentUrl,
            'method' => 'POST',
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_theme_search', array(
                    'term' => $data['term'],
                )));
            }
        } else {
            $form->setData(array(
                'term' => $term,
            ));
        }

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('themes.pagination');
        if (!is_numeric($pagination)) {
            $pagination = 0;
        } else {
            $pagination = (int) $pagination;
        }

        $themes = $em->getRepository('CapcoAppBundle:Theme')->getSearchResultsWithConsultationsAndIdeas($pagination, $page, $term);

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination != 0) {
            $nbPage = ceil(count($themes) / $pagination);
        }

        return array(
            'themes' => $themes,
            'form' => $form->createView(),
            'page' => $page,
            'nbPage' => $nbPage,
        );
    }

    /**
     * @Route("/themes/{slug}", name="app_theme_show", defaults={"_feature_flag" = "themes"})
     * @ParamConverter("theme", class="CapcoAppBundle:Theme", options={"repository_method" = "getOneBySlug"})
     * @Template()
     *
     * @param Theme $theme
     *
     * @return array
     */
    public function showAction(Theme $theme)
    {
        if (false == $theme->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('theme.error.not_found', array(), 'CapcoAppBundle'));
        }

        return array(
            'theme' => $theme,
            'statuses' => Theme::$statuses,
        );
    }
}
