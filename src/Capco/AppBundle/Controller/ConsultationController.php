<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Theme;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
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
     * @param $slug
     * @return array
     */
    public function getProblemsAction($slug)
    {
        $items = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->getProblems($slug);

        if (!isset($items[0])) {
            return new Response('');
        }

        return [ 'items' => $items ];
    }
}
