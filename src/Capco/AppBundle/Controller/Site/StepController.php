<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\CollectStep;
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
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\SerializationContext;

class StepController extends Controller
{
    /**
     * @Route("/project/{projectSlug}/step/{stepSlug}", name="app_project_show_step")
     * @Route("/consultation/{projectSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:OtherStep", options={"mapping": {"stepSlug": "slug"}})
     *
     * @param           $projectSlug
     * @param OtherStep $step
     *
     * @return array
     */
    public function showStepAction($projectSlug, OtherStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/presentation/{stepSlug}", name="app_project_show_presentation")
     * @Route("/consultation/{projectSlug}/presentation/{stepSlug}", name="app_consultation_show_presentation")
     * @Template("CapcoAppBundle:Step:presentation.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:PresentationStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param PresentationStep $step
     *
     * @return array
     */
    public function showPresentationAction($projectSlug, PresentationStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }
        $events = $this->get('capco.event.resolver')->getLastByProject($projectSlug, 2);
        $posts = $this->get('capco.blog.post.repository')->getLastPublishedByProject($projectSlug, 2);
        $nbEvents = $this->get('capco.event.resolver')->countEvents(null, null, $projectSlug, null);
        $nbPosts = $em->getRepository('CapcoAppBundle:Post')->countSearchResults(null, $projectSlug);

        $contributors = $this->get('capco.contribution.resolver')->getProjectContributorsOrdered($project, 10, 1);

        return [
            'project' => $project,
            'currentStep' => $step,
            'events' => $events,
            'posts' => $posts,
            'nbEvents' => $nbEvents,
            'nbPosts' => $nbPosts,
            'contributors' => $contributors,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}", name="app_project_show_collect")
     * @Route("/consultation/{consultationSlug}/collect/{stepSlug}", name="app_consultation_show_collect")
     * @Template("CapcoAppBundle:Step:collect.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:CollectStep", options={"mapping" = {"stepSlug": "slug"}})
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method": "getOne", "map_method_signature": true})
     *
     * @param Project     $project
     * @param CollectStep $step
     *
     * @return array
     */
    public function showCollectAction(Project $project, CollectStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        if (!$project) {
            throw new NotFoundHttpException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}", name="app_project_show_ranking")
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}", name="app_consultation_show_ranking")
     * @Template("CapcoAppBundle:Step:ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param RankingStep $step
     *
     * @return array
     */
    public function showRankingAction($projectSlug, RankingStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $nbOpinionsToDisplay = $step->getNbOpinionsToDisplay() !== null ? $step->getNbOpinionsToDisplay() : 10;
        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByProject($project, $excludedAuthor, true, $nbOpinionsToDisplay)
        ;

        $nbVersionsToDisplay = $step->getNbVersionsToDisplay() !== null ? $step->getNbVersionsToDisplay() : 10;
        $versions = $em
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getEnabledByProject($project, $excludedAuthor, true, $nbVersionsToDisplay)
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'opinions' => $opinions,
            'nbOpinionsToDisplay' => $nbOpinionsToDisplay,
            'versions' => $versions,
            'nbVersionsToDisplay' => $nbVersionsToDisplay,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/opinions/{page}", name="app_project_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/opinions/{page}", name="app_consultation_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:opinions_ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param RankingStep $step
     *
     * @return array
     */
    public function showOpinionsRankingAction($projectSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByProject($project, $excludedAuthor, true, 10, $page)
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_project_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_consultation_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:versions_ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param RankingStep $step
     * @param $page
     *
     * @return array
     */
    public function showVersionsRankingAction($projectSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $versions = $em
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getEnabledByProject($project, $excludedAuthor, true, 10, $page)
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'versions' => $versions,
            'page' => $page,
            'nbPage' => ceil(count($versions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}", name="app_project_show_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}", name="app_consultation_show_synthesis")
     * @Template("CapcoAppBundle:Step:synthesis.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param SynthesisStep $step
     *
     * @return array
     */
    public function showSynthesisAction($projectSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}", name="app_project_show_collect")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:CollectStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function showCollectStepAction(Project $project, CollectStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');

        $types = $serializer->serialize([
            'types' => $em->getRepository('CapcoUserBundle:UserType')->findAll(),
        ], 'json', SerializationContext::create()->setGroups(['Default']));

        $districts = $serializer->serialize([
            'districts' => $em->getRepository('CapcoAppBundle:District')->findAll(),
        ], 'json', SerializationContext::create()->setGroups(['Districts']));

        $themes = $serializer->serialize([
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
        ], 'json', SerializationContext::create()->setGroups(['Themes']));

        $form = $serializer->serialize([
            'form' => $step->getProposalForm(),
        ], 'json', SerializationContext::create()->setGroups(['ProposalForms', 'ProposalResponses', 'Questions']));

        $statuses = $serializer->serialize([
            'statuses' => $step->getStatuses(),
        ], 'json', SerializationContext::create()->setGroups(['Statuses']));

        $response = $this->render('CapcoAppBundle:Step:collect.html.twig', [
            'project' => $project,
            'currentStep' => $step,
            'themes' => $themes,
            'statuses' => $statuses,
            'districts' => $districts,
            'types' => $types,
            'form' => $form,
        ]);

        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_ANONYMOUSLY')) {
            $response->setPublic();
            $response->setSharedMaxAge(60);
        }

        return $response;
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}/edition", name="app_project_edit_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}/edition", name="app_consultation_edit_synthesis")
     * @Template("CapcoAppBundle:Synthesis:main.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param SynthesisStep $step
     *
     * @return array
     */
    public function editSynthesisAction($projectSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay() || !$step->getSynthesis()) {
            throw new NotFoundHttpException();
        }

        if (!$step->getSynthesis()->isEditable() || !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }
}
