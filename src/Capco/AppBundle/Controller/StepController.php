<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Step;
use Capco\AppBundle\Entity\Theme;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class StepController extends Controller
{
    /**
     * @Template("CapcoAppBundle:Step:show_all_in_nav.html.twig")
     *
     * @param Consultation $consultation
     * @param Step         $currentStep
     *
     * @return array
     */
    public function showStepsNavAction(Consultation $consultation, $currentStep = null)
    {
        $em = $this->getDoctrine();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOneBySlugWithEventsAndPosts($consultation->getSlug());
        $steps = $em->getRepository('CapcoAppBundle:Step')->findBy(
            array(
                'consultation' => $consultation,
                'isEnabled' => true,
            ),
            array(
                'position' => 'ASC',
                'startAt' => 'ASC',
            )
        );

        return [
            'consultation' => $consultation,
            'steps' => $steps,
            'currentStep' => $currentStep,
            'stepStatus' => Step::$stepStatus,
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/step/{step_slug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("step", class="CapcoAppBundle:Step", options={"mapping": {"step_slug": "slug"}})
     *
     * @param Consultation $consultation
     * @param Step         $step
     *
     * @return array
     */
    public function showStepAction(Consultation $consultation, Step $step)
    {
        if (!$step->getConsultation()->canDisplay()) {
            throw new NotFoundHttpException();
        }

        if ($step->isConsultationStep()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultation->getSlug());

        return [
            'consultation' => $consultation,
            'statuses' => Theme::$statuses,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/presentation/{step_slug}", name="app_consultation_show_presentation")
     * @Template("CapcoAppBundle:Step:presentation.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Step", options={"mapping" = {"step_slug": "slug"}})
     *
     * @param $consultation_slug
     * @param Step $step
     *
     * @return array
     */
    public function showPresentationAction($consultation_slug, Step $step)
    {
        if ($step->isConsultationStep() || !$step->getConsultation()->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultation_slug);
        $events = $this->get('capco.event.repository')->getLastByConsultation($consultation_slug, 2);
        $posts = $this->get('capco.blog.post.repository')->getLastPublishedByConsultation($consultation_slug, 2);

        return [
            'consultation' => $consultation,
            'statuses' => Theme::$statuses,
            'currentStep' => $step,
            'events' => $events,
            'posts' => $posts,
        ];
    }
}
