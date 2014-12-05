<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
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

    /**
     * @Route("/consultation/{slug}", name="app_consultation_show")
     * @Template()
     * @param Consultation $consultation
     * @return array
     */
    public function showAction(Consultation $consultation)
    {
        return array(
            'theme' => $consultation,
            'statuses' => \Capco\AppBundle\Entity\Theme::$statuses
        );
    }

}
