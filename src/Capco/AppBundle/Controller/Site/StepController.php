<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Resolver\EventResolver;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectContributorResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class StepController extends Controller
{
    /**
     * @Route("/project/{projectSlug}/step/{stepSlug}", name="app_project_show_step")
     * @Route("/consultation/{projectSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @ParamConverter("project", class="Capco\AppBundle\Entity\Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\OtherStep", options={"mapping": {"stepSlug": "slug"}})
     */
    public function showStepAction(Request $request, Project $project, OtherStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
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
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\PresentationStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function showPresentationAction(
        Request $request,
        Project $project,
        PresentationStep $step
    ) {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }
        $projectSlug = $project->getSlug();
        $events = $this->get(EventResolver::class)->getLastByProject($projectSlug, 2);
        $posts = $this->get(PostRepository::class)->getLastPublishedByProject($projectSlug, 2);
        $nbEvents = $this->get(EventResolver::class)->countEvents(null, null, $projectSlug, null);
        $nbPosts = $this->get(PostRepository::class)->countSearchResults(null, $projectSlug);

        $projectContributorResolver = $this->get(ProjectContributorResolver::class);

        $contributorsConnection = $projectContributorResolver->__invoke(
            $project,
            new Argument(['first' => 10])
        );

        $showVotes = $this->get(ProjectHelper::class)->hasStepWithVotes($project);

        return [
            'project' => $project,
            'currentStep' => $step,
            'events' => $events,
            'posts' => $posts,
            'nbEvents' => $nbEvents,
            'nbPosts' => $nbPosts,
            'showVotes' => $showVotes,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}", name="app_project_show_ranking")
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}", name="app_consultation_show_ranking")
     * @Template("CapcoAppBundle:Step:ranking.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function showRankingAction(Request $request, Project $project, RankingStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking()
            ? $project->getAuthor()->getId()
            : null;

        $nbOpinionsToDisplay = $step->getNbOpinionsToDisplay() ?? 10;
        $opinions = $this->get(OpinionRepository::class)->getEnabledByProject(
            $project,
            $excludedAuthor,
            true,
            $nbOpinionsToDisplay
        );

        $nbVersionsToDisplay = $step->getNbVersionsToDisplay() ?? 10;
        $versions = $this->get(OpinionVersionRepository::class)->getEnabledByProject(
            $project,
            $excludedAuthor,
            true,
            $nbVersionsToDisplay
        );

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
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function showOpinionsRankingAction(
        Request $request,
        Project $project,
        RankingStep $step,
        $page = 1
    ) {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking()
            ? $project->getAuthor()->getId()
            : null;

        $opinions = $this->get(OpinionRepository::class)->getEnabledByProject(
            $project,
            $excludedAuthor,
            true,
            10,
            $page
        );

        return [
            'project' => $project,
            'currentStep' => $step,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(\count($opinions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_project_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_consultation_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:versions_ranking.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function showVersionsRankingAction(
        Request $request,
        Project $project,
        RankingStep $step,
        $page = 1
    ) {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking()
            ? $project->getAuthor()->getId()
            : null;

        $versions = $this->get(OpinionVersionRepository::class)->getEnabledByProject(
            $project,
            $excludedAuthor,
            true,
            10,
            $page
        );

        return [
            'project' => $project,
            'currentStep' => $step,
            'versions' => $versions,
            'page' => $page,
            'nbPage' => ceil(\count($versions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}", name="app_project_show_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}", name="app_consultation_show_synthesis")
     * @Template("CapcoAppBundle:Step:synthesis.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function showSynthesisAction(Request $request, Project $project, SynthesisStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $serializer = $this->get('serializer');

        $props = $serializer->serialize(
            ['synthesis_id' => $step->getSynthesis()->getId(), 'mode' => 'view'],
            'json'
        );

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}", name="app_project_show_collect")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\CollectStep", options={"mapping" = {"stepSlug": "slug"}, "repository_method"= "getOneBySlug", "map_method_signature" = true})
     * @Template("CapcoAppBundle:Step:collect.html.twig")
     */
    public function showCollectStepAction(Request $request, Project $project, CollectStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        if (!$step->getProposalForm()) {
            $this->createNotFoundException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}", name="app_project_show_questionnaire")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\QuestionnaireStep", options={"mapping" = {"stepSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @Template("CapcoAppBundle:Step:questionnaire.html.twig")
     */
    public function showQuestionnaireStepAction(
        Request $request,
        Project $project,
        QuestionnaireStep $step
    ) {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $serializer = $this->get('serializer');
        $props = $serializer->serialize(
            [
                'step' => $step,
                'questionnaireId' => $step->getQuestionnaire()
                    ? GlobalId::toGlobalId('Questionnaire', $step->getQuestionnaire()->getId())
                    : null,
            ],
            'json',
            [
                'groups' => ['Questionnaires', 'Questions', 'QuestionnaireSteps', 'Steps'],
            ]
        );

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/selection/{stepSlug}", name="app_project_show_selection")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\SelectionStep", options={"mapping" = {"stepSlug": "slug"}})
     * @Template("CapcoAppBundle:Step:selection.html.twig")
     */
    public function showSelectionStepAction(Request $request, Project $project, SelectionStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'proposalForm' => null,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}/edition", name="app_project_edit_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}/edition", name="app_consultation_edit_synthesis")
     * @Template("CapcoAppBundle:Synthesis:main.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     */
    public function editSynthesisAction(Request $request, Project $project, SynthesisStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        if (
            !$step->getSynthesis()->isEditable() ||
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle')
            );
        }

        $serializer = $this->get('serializer');

        $props = $serializer->serialize(
            ['synthesis_id' => $step->getSynthesis()->getId(), 'mode' => 'edit'],
            'json'
        );

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}", name="app_project_show")
     * @Route("/project/{projectSlug}/consultation/{stepSlug}", name="app_project_show_consultation")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *    "mapping": {"projectSlug": "slug"},
     *    "repository_method"="getOneWithoutVisibility",
     *    "map_method_signature" = true
     * })
     * @ParamConverter("currentStep", class="CapcoAppBundle:Steps\ConsultationStep", options={
     *    "mapping": {"stepSlug": "slug"},
     *    "method"="getOne",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Consultation:show.html.twig")
     */
    public function showConsultationAction(Project $project, ConsultationStep $currentStep)
    {
        if (!$currentStep->canDisplay($this->getUser())) {
            $error = $this->get('translator')->trans(
                'project.error.not_found',
                [],
                'CapcoAppBundle'
            );

            throw new ProjectAccessDeniedException($error);
        }

        $serializer = $this->get('serializer');

        $stepProps = $serializer->serialize(['step' => $currentStep], 'json', [
            'groups' => ['ConsultationSteps', 'Steps', 'UserVotes'],
        ]);

        return [
            'project' => $project,
            'currentStep' => $currentStep,
            'stepProps' => $stepProps,
        ];
    }
}
