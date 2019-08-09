<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class StepController extends Controller
{
    /**
     * @Route("/project/{projectSlug}/step/{stepSlug}", name="app_project_show_step")
     * @Route("/consultation/{projectSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @ParamConverter("project", class="Capco\AppBundle\Entity\Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showStepAction(Project $project, OtherStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'project' => $project,
            'currentStep' => $step
        ];
    }

    /**
     * @Route("/project/{projectSlug}/presentation/{stepSlug}", name="app_project_show_presentation")
     * @Route("/consultation/{projectSlug}/presentation/{stepSlug}", name="app_consultation_show_presentation")
     * @Template("CapcoAppBundle:Step:presentation.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showPresentationAction(Project $project, PresentationStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }
        $projectSlug = $project->getSlug();
        $posts = $this->get(PostRepository::class)->getLastPublishedByProject($projectSlug, 2);
        $nbPosts = $this->get(PostRepository::class)->countSearchResults(null, $projectSlug);

        $showVotes = $this->get(ProjectHelper::class)->hasStepWithVotes($project);

        return [
            'project' => $project,
            'currentStep' => $step,
            'posts' => $posts,
            'nbPosts' => $nbPosts,
            'showVotes' => $showVotes
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}", name="app_project_show_ranking")
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}", name="app_consultation_show_ranking")
     * @Template("CapcoAppBundle:Step:ranking.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showRankingAction(Project $project, RankingStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking()
            ? $project->getFirstAuthor()->getId()
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
            'nbVersionsToDisplay' => $nbVersionsToDisplay
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/opinions/{page}", name="app_project_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/opinions/{page}", name="app_consultation_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:opinions_ranking.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showOpinionsRankingAction(Project $project, RankingStep $step, $page = 1)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking()
            ? $project->getFirstAuthor()->getId()
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
            'nbPage' => ceil(\count($opinions) / 10)
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_project_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_consultation_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:versions_ranking.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showVersionsRankingAction(Project $project, RankingStep $step, $page = 1)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking()
            ? $project->getFirstAuthor()->getId()
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
            'nbPage' => ceil(\count($versions) / 10)
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}", name="app_project_show_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}", name="app_consultation_show_synthesis")
     * @Template("CapcoAppBundle:Step:synthesis.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showSynthesisAction(Project $project, SynthesisStep $step)
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
            'props' => $props
        ];
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}", name="app_project_show_collect")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:collect.html.twig")
     */
    public function showCollectStepAction(Project $project, CollectStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        if (!$step->getProposalForm()) {
            $this->createNotFoundException();
        }

        return [
            'project' => $project,
            'currentStep' => $step
        ];
    }

    /**
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}", name="app_project_show_questionnaire")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:questionnaire.html.twig")
     */
    public function showQuestionnaireStepAction(Project $project, QuestionnaireStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $serializer = $this->get('serializer');
        $props = $serializer->serialize(
            [
                'step' => $step,
                'questionnaireId' => $step->getQuestionnaire()
                    ? GlobalId::toGlobalId('Questionnaire', $step->getQuestionnaire()->getId())
                    : null
            ],
            'json',
            [
                'groups' => ['Questionnaires', 'Questions', 'QuestionnaireSteps', 'Steps']
            ]
        );

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props
        ];
    }

    /**
     * @Route("/project/{projectSlug}/selection/{stepSlug}", name="app_project_show_selection")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:selection.html.twig")
     */
    public function showSelectionStepAction(Project $project, SelectionStep $step)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'proposalForm' => null
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}/edition", name="app_project_edit_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}/edition", name="app_consultation_edit_synthesis")
     * @Template("CapcoAppBundle:Synthesis:main.html.twig")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function editSynthesisAction(Project $project, SynthesisStep $step)
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
            'props' => $props
        ];
    }

    /**
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/consultation/{consultationSlug}", name="app_project_consultations_show_consultation")
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}", name="app_project_show")
     * @Route("/project/{projectSlug}/consultation/{stepSlug}", name="app_project_show_consultation")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *    "mapping": {"projectSlug": "slug"},
     *    "repository_method"="getOneWithoutVisibility",
     *    "map_method_signature" = true
     * })
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={
     *    "mapping": {"stepSlug": "stepSlug", "projectSlug": "projectSlug", "consultationSlug": "consultationSlug"},
     *    "repository_method"="findOneBySlugs",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Consultation:show.html.twig")
     */
    public function showConsultationAction(Project $project, ConsultationStep $step, ?Consultation $consultation = null)
    {
        if (!$step->canDisplay($this->getUser())) {
            $error = $this->get('translator')->trans(
                'project.error.not_found',
                [],
                'CapcoAppBundle'
            );

            throw new ProjectAccessDeniedException($error);
        }

        $isMultiConsultation = $step->getConsultations()->count() > 1;

        if (!$consultation && $isMultiConsultation) {
            return $this->redirectToRoute('app_project_show_consultations', [
                'stepSlug' => $step->getSlug(),
                'projectSlug' => $project->getSlug()
            ]);
        }

        // To keep the same old URI to handle consultion show and supporting the new URI for showing a consultation
        // with a slug, we have to handle both case. If the step has only 1 consultation, we should keep the old behaviour
        if ($step->getFirstConsultation()) {
            $consultationSlug = $consultation ?
                $consultation->getSlug() :
                $step->getFirstConsultation()->getSlug();
        } else {
            $consultationSlug = $consultation ?
                $consultation->getSlug() :
                null;
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'stepProps' => [
                'id' => GlobalId::toGlobalId('ConsultationStep', $step->getId()),
                'consultationSlug' => $consultationSlug,
                'isMultiConsultation' => $isMultiConsultation
            ],
        ];
    }

    /**
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/consultations", name="app_project_show_consultations")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *    "mapping": {"projectSlug": "slug"},
     *    "repository_method"="getOneWithoutVisibility",
     *    "map_method_signature" = true
     * })
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Consultation:list.html.twig")
     */
    public function showConsultationsAction(Project $project, ConsultationStep $step)
    {
        if (!$step->canDisplay($this->getUser())) {
            $error = $this->get('translator')->trans(
                'project.error.not_found',
                [],
                'CapcoAppBundle'
            );

            throw new ProjectAccessDeniedException($error);
        }

        if ($step->getConsultations()->count() <= 1) {
            return $this->redirectToRoute('app_project_show_consultation', [
                'stepSlug' => $step->getSlug(),
                'projectSlug' => $project->getSlug()
            ]);
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'stepProps' => [
                'id' => GlobalId::toGlobalId('ConsultationStep', $step->getId())
            ]
        ];
    }
}
