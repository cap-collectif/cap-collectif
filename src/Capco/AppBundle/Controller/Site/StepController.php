<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OtherStep;
use Capco\AppBundle\Entity\PresentationStep;
use Capco\AppBundle\Entity\Theme;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class StepController extends Controller
{
    /**
     * @Route("/consultation/{consultationSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @ParamConverter("step", class="CapcoAppBundle:OtherStep", options={"mapping": {"stepSlug": "slug"}})
     *
     * @param Consultation $consultation
     * @param OtherStep    $step
     *
     * @return array
     */
    public function showStepAction(Consultation $consultation, OtherStep $step)
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
     * @Route("/consultation/{consultationSlug}/presentation/{stepSlug}", name="app_consultation_show_presentation")
     * @Template("CapcoAppBundle:Step:presentation.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:PresentationStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $consultationSlug
     * @param PresentationStep $step
     *
     * @return array
     */
    public function showPresentationAction($consultationSlug, PresentationStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultationSlug);
        $events = $this->get('capco.event.resolver')->getLastByConsultation($consultationSlug, 2);
        $posts = $this->get('capco.blog.post.repository')->getLastPublishedByConsultation($consultationSlug, 2);
        $nbEvents = $this->get('capco.event.resolver')->countEvents(null, null, $consultationSlug, null);
        $nbPosts = $em->getRepository('CapcoAppBundle:Post')->countSearchResults(null, $consultationSlug);

        $contributors = $this->get('capco.contribution.resolver')->getConsultationContributorsOrdered($consultation);

        return [
            'consultation' => $consultation,
            'statuses' => Theme::$statuses,
            'currentStep' => $step,
            'events' => $events,
            'posts' => $posts,
            'nbEvents' => $nbEvents,
            'nbPosts' => $nbPosts,
            'contributors' => $contributors,
        ];
    }
}
