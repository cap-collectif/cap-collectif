<?php

namespace Capco\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;

class HomepageController extends Controller
{
    /**
     * @Route("/")
     * @Template()
     */
    public function homepageAction()
    {
        return array(
            // ...
        );
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastConsultationsAction($max = 4, $offset = 0)
    {
        $consultations = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->getLast($max, $offset);

        if (!isset($consultations[0])) {
            return new Response('');
        }

        return [
            'consultations' => $consultations,
            'statuses' => \Capco\AppBundle\Entity\Consultation::$openingStatuses
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastIdeasAction($max = 4, $offset = 0)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getLast($max, $offset);

        if (!isset($ideas[0])) {
            return new Response('');
        }

        return [ 'ideas' => $ideas ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastTopicsAction($max = 4, $offset = 0)
    {
        $topics = $this->getDoctrine()->getRepository('CapcoAppBundle:Theme')->getLast($max, $offset);

        if (!isset($topics[0])) {
            return new Response('');
        }

        return [ 'topics' => $topics ];
    }
}
