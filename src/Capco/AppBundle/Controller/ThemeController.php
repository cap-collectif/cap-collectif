<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\ThemeSearchType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ThemeController extends Controller
{

    /**
     * @Route("/themes/{page}", name="app_theme", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/themes/search/{term}/{page}", name="app_theme_search", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Template()
     * @param $page
     * @param $request
     * @param $term
     * @return array
     */
    public function indexAction(Request $request, $page, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_theme');

        $form = $this->createForm(new ThemeSearchType(), null, array(
            'action' => $currentUrl,
            'method' => 'POST'
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_theme_search', array(
                    'term' => $data['term']
                )));
            }
        } else {
            $form->setData(array(
                'term' => $term,
            ));
        }

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('themes.pagination');
        if (!is_numeric($pagination)){
            $pagination = 0;
        } else {
            $pagination = (int)$pagination;
        }

        $themes = $em->getRepository('CapcoAppBundle:Theme')->getSearchResultsWithConsultationsAndIdeas($pagination, $page, $term);

        //Avoid division by 0 in nbPage calculation
        if($pagination == 0){
            $pagination = ceil(count($themes));
        }

        return array(
            'themes' => $themes,
            'form' => $form->createView(),
            'page' => $page,
            'nbPage' => ceil(count($themes) / $pagination)
        );
    }

    /**
     * @Route("/themes/{slug}", name="app_theme_show")
     * @Template()
     * @param Theme $theme
     * @return array
     */
    public function showAction(Theme $theme)
    {
        return array(
            'theme' => $theme,
            'statuses' => Theme::$statuses
        );
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Consultation:lastConsultations.html.twig")
     * @param $theme
     * @return array
     */
    public function themeConsultationsAction(Theme $theme = null)
    {
        $consultations = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->findByTheme($theme->getId());

        return [
            'consultations' => $consultations,
            'statuses' => Consultation::$openingStatuses
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Idea:lastIdeas.html.twig")
     * @param $theme
     * @return array
     */
    public function themeIdeasAction(Theme $theme = null)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->findByTheme($theme->getId());

        return [ 'ideas' => $ideas ];
    }

}
