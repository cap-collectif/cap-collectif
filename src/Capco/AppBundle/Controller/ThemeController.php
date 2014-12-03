<?php

namespace Capco\AppBundle\Controller;

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
     * @Route("/themes/{term}/{page}", name="app_theme_search", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Template()
     * @param $page
     * @return array
     */
    public function indexAction($page, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_theme');

        $form = $this->createForm(new ThemeSearchType(), null, array(
            'action' => $currentUrl,
            'method' => 'POST'
        ));
        $request = $this->getRequest();

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

        $themes = $em->getRepository('CapcoAppBundle:Theme')->getSearchResultsWithConsultationsAndIdeas(8, $page, $term);

        return array(
            'themes' => $themes,
            'form' => $form->createView(),
            'page' => $page,
            'nbPage' => ceil(count($themes) / 8)
        );
    }

    /**
     * @Route("/theme/{slug}", name="app_theme_show")
     * @Template()
     * @param Theme $theme
     * @return array
     */
    public function showAction(Theme $theme)
    {
        return array(
            'theme' => $theme,
            'statuses' => \Capco\AppBundle\Entity\Theme::$statuses
        );
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastConsultationsAction($theme = null)
    {
        $consultations = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->findByTheme($theme->getId());

        return [
            'consultations' => $consultations,
            'statuses' => \Capco\AppBundle\Entity\Consultation::$openingStatuses
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastIdeasAction($theme = null)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->findByTheme($theme->getId());

        return [ 'ideas' => $ideas ];
    }

}
