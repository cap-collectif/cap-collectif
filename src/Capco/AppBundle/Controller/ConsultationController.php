<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Theme;
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
     * @Template()
     * @param $page
     * @return array
     */
    public function indexAction($page)
    {
        $em = $this->getDoctrine()->getManager();
        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->getSearchResultsWithTheme(4, $page);

        return [
            'consultations' => $consultations,
            'statuses' => \Capco\AppBundle\Entity\Consultation::$openingStatuses,
            'page' => $page,
            'nbPage' => ceil(count($consultations) / 4)
        ];
    }

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
            'statuses' => Theme::$statuses
        ];
    }

    /**
     * @Template()
     * @param $consultation
     * @param $offset
     * @param $limit
     * @return array
     */
    public function getOpinionsAction(Consultation $consultation, $offset, $limit)
    {
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByType($consultation, $offset, $limit);

        if (!isset($blocks[0])) {
            return new Response('');
        }

        return [ 'blocks' => $blocks ];
    }

    /**
     * @Template()
     * @param $consultation
     * @return array
     */
    public function getProblemsAction($consultation)
    {
        $items = $this->getDoctrine()->getRepository('CapcoAppBundle:ProblemType')->findByType($consultation);

        if (!isset($items[0])) {
            return new Response('');
        }

        return [ 'items' => $items ];
    }

    /**
     * @Template()
     * @param $consultation
     * @param $type
     * @return array
     */
    public function getNavOpinionTypeAction(Consultation $consultation, $type)
    {
        $consultationCurrent = $consultation->getSlug();
        $opinionsTypes = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByType($consultation);

        return [
            'opinionsTypes' => $opinionsTypes,
            'opinionTypeCurrent' => $type,
            'consultationCurrent' => $consultationCurrent
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}", name="app_consultation_show_opinions")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opiniontype", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:blockOpinions.html.twig")
     * @param Consultation $consultation
     * @param OpinionType $opiniontype
     * @return array
     */
    public function getOpinionsTypeAction(Consultation $consultation, OpinionType $opiniontype)
    {
        $currentUrl = $this->generateUrl('app_consultation_show_opinions', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opiniontype->getSlug() ]);
        $opinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->findBy(
            array('Consultation' => $consultation, 'OpinionType' => $opiniontype),
            array('createdAt' => 'desc')
        );

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $consultation,
            'opinions' => $opinions,
        ];
    }
}
