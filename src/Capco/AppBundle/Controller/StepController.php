<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Step;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class StepController extends Controller
{

    /**
     * @Template("CapcoAppBundle:Step:show_all_in_nav.html.twig")
     * @param Consultation $consultation
     * @return array
     */
    public function showAllInNavAction(Consultation $consultation)
    {
        $em = $this->getDoctrine();
        $steps = $em->getRepository('CapcoAppBundle:Step')->findBy(
            array(
                'consultation' => $consultation,
                'isEnabled' => true
            ),
            array(
                'position' => 'ASC',
                'startAt' => 'ASC',
            )
        );

        return [
            'consultation' => $consultation,
            'steps' => $steps,
        ];
    }

    /**
     * @Route("/secure/consultation/{consultation_slug}/step/{step_slug}", name="app_consultation_show_step")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("step", class="CapcoAppBundle:Step", options={"mapping": {"step_slug": "slug"}})
     * @Template()
     * @param Consultation $consultation
     * @param Step $step
     * @return array
     */
    public function showStepAction(Consultation $consultation, Step $step)
    {
        $stepTypes = Step::$stepTypes;
        switch ($step->getType()) {

            case $stepTypes['consultation']:
                return $this->redirect($this->generateUrl('app_consultation_show', array('slug' => $consultation->getSlug())));
                break;
            
            default:
                if (null != $step->getPage()) {
                    return $this->redirect($this->generateUrl('app_page_show', array('slug' => $step->getPage()->getSlug())));
                }
                break;
        }
        return $this->redirect($this->generateUrl('app_consultation_show', array('slug' => $consultation->getSlug())));
    }

}
