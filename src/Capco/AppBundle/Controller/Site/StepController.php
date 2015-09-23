<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OtherStep;
use Capco\AppBundle\Entity\PresentationStep;
use Capco\AppBundle\Entity\RankingStep;
use Capco\AppBundle\Entity\SynthesisStep;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

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
        if (!$consultation) {
            throw new NotFoundHttpException();
        }
        $events = $this->get('capco.event.resolver')->getLastByConsultation($consultationSlug, 2);
        $posts = $this->get('capco.blog.post.repository')->getLastPublishedByConsultation($consultationSlug, 2);
        $nbEvents = $this->get('capco.event.resolver')->countEvents(null, null, $consultationSlug, null);
        $nbPosts = $em->getRepository('CapcoAppBundle:Post')->countSearchResults(null, $consultationSlug);

        $contributors = $this->get('capco.contribution.resolver')->getConsultationContributorsOrdered($consultation);

        return [
            'consultation' => $consultation,
            'currentStep' => $step,
            'events' => $events,
            'posts' => $posts,
            'nbEvents' => $nbEvents,
            'nbPosts' => $nbPosts,
            'contributors' => $contributors,
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/ranking/{stepSlug}", name="app_consultation_show_ranking")
     * @Template("CapcoAppBundle:Step:ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $consultationSlug
     * @param RankingStep $step
     *
     * @return array
     */
    public function showRankingAction($consultationSlug, RankingStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultationSlug);
        if (!$consultation) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$consultation->getIncludeAuthorInRanking() ? $consultation->getAuthor()->getId() : null;

        $nbOpinionsToDisplay = $step->getNbOpinionsToDisplay() !== null ? $step->getNbOpinionsToDisplay() : 10;
        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByConsultation($consultation, $excludedAuthor, true, $nbOpinionsToDisplay)
        ;

        $nbVersionsToDisplay = $step->getNbVersionsToDisplay() !== null ? $step->getNbVersionsToDisplay() : 10;
        $versions = $em
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getEnabledByConsultation($consultation, $excludedAuthor, true, $nbVersionsToDisplay)
        ;

        return [
            'consultation' => $consultation,
            'currentStep' => $step,
            'opinions' => $opinions,
            'nbOpinionsToDisplay' => $nbOpinionsToDisplay,
            'versions' => $versions,
            'nbVersionsToDisplay' => $nbVersionsToDisplay,
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/ranking/{stepSlug}/opinions/{page}", name="app_consultation_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:opinions_ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $consultationSlug
     * @param RankingStep $step
     *
     * @return array
     */
    public function showOpinionsRankingAction($consultationSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultationSlug);
        if (!$consultation) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$consultation->getIncludeAuthorInRanking() ? $consultation->getAuthor()->getId() : null;

        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByConsultation($consultation, $excludedAuthor, true, 10, $page)
        ;

        return [
            'consultation' => $consultation,
            'currentStep' => $step,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10),
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/ranking/{stepSlug}/versions/{page}", name="app_consultation_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:versions_ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $consultationSlug
     * @param RankingStep $step
     * @param $page
     *
     * @return array
     */
    public function showVersionsRankingAction($consultationSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultationSlug);
        if (!$consultation) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$consultation->getIncludeAuthorInRanking() ? $consultation->getAuthor()->getId() : null;

        $versions = $em
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getEnabledByConsultation($consultation, $excludedAuthor, true, 10, $page)
        ;

        return [
            'consultation' => $consultation,
            'currentStep' => $step,
            'versions' => $versions,
            'page' => $page,
            'nbPage' => ceil(count($versions) / 10),
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/synthesis/{stepSlug}", name="app_consultation_show_synthesis")
     * @Template("CapcoAppBundle:Step:synthesis.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $consultationSlug
     * @param SynthesisStep $step
     *
     * @return array
     */
    public function showSynthesisAction($consultationSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultationSlug);
        if (!$consultation) {
            throw new NotFoundHttpException();
        }

        return [
            'consultation' => $consultation,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/synthesis/{stepSlug}/edition", name="app_consultation_edit_synthesis")
     * @Template("CapcoAppBundle:Synthesis:main.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $consultationSlug
     * @param SynthesisStep $step
     *
     * @return array
     */
    public function editSynthesisAction($consultationSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay() || !$step->getSynthesis()) {
            throw new NotFoundHttpException();
        }

        if (!$step->getSynthesis()->isEditable() || !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOne($consultationSlug);
        if (!$consultation) {
            throw new NotFoundHttpException();
        }

        return [
            'consultation' => $consultation,
            'currentStep' => $step,
        ];
    }
}
