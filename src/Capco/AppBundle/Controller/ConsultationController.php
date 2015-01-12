<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Step;
use Capco\AppBundle\Form\ConsultationSearchType;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ConsultationController extends Controller
{

    /**
     * @Route("/consultations/{page}", name="app_consultation", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/consultations/{theme}/{sort}/{page}", name="app_consultation_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all"} )
     * @Route("/consultations/{theme}/{sort}/{term}/{page}", name="app_consultation_search_term", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all"} )
     * @Template()
     * @param $page
     * @param $request
     * @param $theme
     * @param $sort
     * @param $term
     * @return array
     */
    public function indexAction(Request $request, $page, $theme = null, $sort = null, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_consultation');

        $form = $this->createForm(new ConsultationSearchType(), null, array(
                'action' => $currentUrl,
                'method' => 'POST'
            ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_consultation_search_term', array(
                            'theme' => $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                            'sort' => $data['sort'],
                            'term' => $data['term']
                        )));
            }
        } else {
            $form->setData(array(
                    'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                    'sort' => $sort,
                    'term' => $term,
                ));
        }

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('consultations.pagination');
        if (!is_numeric($pagination)){
            $pagination = 0;
        } else {
            $pagination = (int)$pagination;
        }

        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->getSearchResultsWithTheme($pagination, $page, $theme, $sort, $term);

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if($pagination != 0){
            $nbPage = ceil(count($consultations) / $pagination);
        }

        return [
            'consultations' => $consultations,
            'statuses' => Consultation::$openingStatuses,
            'page' => $page,
            'nbPage' => $nbPage,
            'form' => $form->createView()
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Consultation:lastConsultations.html.twig")
     * @param $max
     * @param $offset
     * @return array
     */
    public function lastOpenConsultationsAction($max = 4, $offset = 0)
    {
        $consultations = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->getLastOpen($max, $offset);

        return [
            'consultations' => $consultations,
            'statuses' => Consultation::$openingStatuses
        ];
    }

    // Page consultation

    /**
     * @Route("/consultation/{slug}", name="app_consultation_show")
     * @Template()
     * @param Consultation $consultation
     * @return array
     */
    public function showAction(Consultation $consultation)
    {
        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getFirstResultWithMedia($consultation->getSlug());

        return [
            'consultation' => $consultation,
            'statuses' => Theme::$statuses,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Consultation:show_nav.html.twig")
     * @param $consultation
     * @param $type
     * @return array
     */
    public function showNavOpinionTypesAction(Consultation $consultation, $type)
    {
        $consultationCurrent = $consultation->getSlug();
        $opinionsTypes = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findAllByPosition();

        return [
            'opinionsTypes' => $opinionsTypes,
            'opinionTypeCurrent' => $type,
            'consultationCurrent' => $consultationCurrent
        ];
    }

    /**
     * @Template("CapcoAppBundle:Consultation:show_opinions.html.twig")
     * @param $consultation
     * @return array
     */
    public function showOpinionsAction(Consultation $consultation)
    {
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByType($consultation);

        return [ 'blocks' => $blocks ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/opinions/{opinion_type_slug}/{page}", name="app_consultation_show_opinions", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opiniontype", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_by_type.html.twig")
     * @param Consultation $consultation
     * @param OpinionType $opiniontype
     * @param $page
     * @return array
     */
    public function showByTypeAction(Consultation $consultation, OpinionType $opiniontype, $page)
    {
        $currentUrl = $this->generateUrl('app_consultation_show_opinions', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opiniontype->getSlug() ]);
        $opinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getEnabledOpinionsByOpinionTypeAndConsultation($consultation, $opiniontype, 10, $page);

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $consultation,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10),
        ];
    }

}
