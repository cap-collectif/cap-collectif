<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Search\OpinionSearch;
use Capco\AppBundle\Search\VersionSearch;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;

class StepController extends Controller
{
    private TranslatorInterface $translator;
    private SerializerInterface $serializer;
    private OpinionSearch $opinionSearch;
    private VersionSearch $versionSearch;

    public function __construct(
        TranslatorInterface $translator,
        SerializerInterface $serializer,
        OpinionSearch $opinionSearch,
        VersionSearch $versionSearch
    ) {
        $this->translator = $translator;
        $this->serializer = $serializer;
        $this->opinionSearch = $opinionSearch;
        $this->versionSearch = $versionSearch;
    }

    /**
     * @Route("/project/{projectSlug}/step/{stepSlug}", name="app_project_show_step")
     * @Route("/consultation/{projectSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @Entity("project", class="Capco\AppBundle\Entity\Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\OtherStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showStepAction(Project $project, OtherStep $step)
    {
        if (!$project->viewerCanSee($this->getUser())) {
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
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\PresentationStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showPresentationAction(Project $project, PresentationStep $step)
    {
        if (!$project->viewerCanSee($this->getUser())) {
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
            'showVotes' => $showVotes,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/debate/{stepSlug}", name="app_project_show_debate")
     * @Template("CapcoAppBundle:Step:debate.html.twig")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\DebateStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showDebateAction(Project $project, DebateStep $step)
    {
        if (!$project->viewerCanSee($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @deprecated
     * This step only used for:
     * - (Dev) https://capco.dev/project/croissance-innovation-disruption/ranking/classement-des-propositions-et-modifications
     * - (Prod) https://www.republique-numerique.fr/project/projet-de-loi-numerique/ranking/reponses-du-gouvernement
     * - (Prod) https://monterritoireendebat.fr/project/une-demarche-participative-pour-les-plages-de-demain/ranking/resultat-du-questionnaire-et-synthese-des-idees
     *
     * @Route("/project/{projectSlug}/ranking/{stepSlug}", name="app_project_show_ranking")
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}", name="app_consultation_show_ranking")
     * @Template("CapcoAppBundle:Step:ranking.html.twig")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\RankingStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showRankingAction(Project $project, RankingStep $step)
    {
        if (!$project->viewerCanSee($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $opinions = $this->opinionSearch
            ->getByCriteriaOrdered(
                [
                    'project.id' => $project->getId(),
                ],
                'popular',
                500
            )
            ->getEntities();

        $nbOpinionsToDisplay = $step->getNbOpinionsToDisplay() ?? 10;
        $nbVersionsToDisplay = $step->getNbVersionsToDisplay() ?? 10;

        $versions = $this->versionSearch
            ->getByCriteriaOrdered(
                [
                    'project.id' => $project->getId(),
                ],
                'popular',
                500
            )
            ->getEntities();

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
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\RankingStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showOpinionsRankingAction(Project $project, RankingStep $step, $page = 1)
    {
        if (!$project->viewerCanSee($this->getUser())) {
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
            'nbPage' => ceil(\count($opinions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_project_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_consultation_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:versions_ranking.html.twig")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\RankingStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function showVersionsRankingAction(Project $project, RankingStep $step, $page = 1)
    {
        if (!$project->viewerCanSee($this->getUser())) {
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
            'nbPage' => ceil(\count($versions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}/", name="app_project_show_collect_trailing_slash")
     * @Route("/project/{projectSlug}/collect/{stepSlug}", name="app_project_show_collect")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\CollectStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:collect.html.twig")
     */
    public function showCollectStepAction(Project $project, CollectStep $step)
    {
        if (!$project->viewerCanSee($this->getUser())) {
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
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}/replies/{replyId}", name="app_project_show_questionnaire_reply")
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}/", name="app_project_show_questionnaire_trailing_slash")
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}", name="app_project_show_questionnaire")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\QuestionnaireStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:questionnaire.html.twig")
     */
    public function showQuestionnaireStepAction(
        Project $project,
        QuestionnaireStep $step,
        ?string $replyId = null
    ) {
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            throw new ProjectAccessDeniedException();
        }

        if ($replyId) {
            $decodedId = GlobalId::fromGlobalId($replyId)['id'];
            if ($decodedId) {
                $reply = $this->get(ReplyRepository::class)->find($decodedId);
            }
            if (!$viewer || !$decodedId || !$reply || !$reply->viewerCanSee($viewer)) {
                return $this->redirectToRoute('app_project_show_questionnaire', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                ]);
            }
        }

        $props = $this->serializer->serialize(
            [
                'step' => $step,
                'isPrivateResult' => $step->getQuestionnaire()
                    ? $step->getQuestionnaire()->isPrivateResult()
                    : false,
                'questionnaireId' => $step->getQuestionnaire()
                    ? GlobalId::toGlobalId('Questionnaire', $step->getQuestionnaire()->getId())
                    : null,
                'projectSlug' => $project->getSlug(),
                'projectId' => GlobalId::toGlobalId('Project', $project->getId()),
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
     * @Route("/project/{projectSlug}/selection/{stepSlug}/", name="app_project_show_selection_trailing_slash")
     * @Route("/project/{projectSlug}/selection/{stepSlug}", name="app_project_show_selection")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\SelectionStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:selection.html.twig")
     */
    public function showSelectionStepAction(Project $project, SelectionStep $step)
    {
        if (!$project->viewerCanSee($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'proposalForm' => null,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/consultation/{consultationSlug}", name="app_project_consultations_show_consultation")
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}", name="app_project_show")
     * @Route("/project/{projectSlug}/consultation/{stepSlug}", name="app_project_show_consultation")
     * @Entity("project", class="CapcoAppBundle:Project", options={
     *    "mapping": {"projectSlug": "slug"},
     *    "repository_method"="getOneWithoutVisibility",
     *    "map_method_signature" = true
     * })
     * @Entity("step", class="CapcoAppBundle:Steps\ConsultationStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Entity("consultation", class="CapcoAppBundle:Consultation", options={
     *    "mapping": {"stepSlug": "stepSlug", "projectSlug": "projectSlug", "consultationSlug": "consultationSlug"},
     *    "repository_method"="findOneBySlugs",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Consultation:show.html.twig")
     */
    public function showConsultationAction(
        Project $project,
        ConsultationStep $step,
        ?Consultation $consultation = null
    ) {
        if (!$step->canDisplay($this->getUser())) {
            $error = $this->translator->trans('project.error.not_found', [], 'CapcoAppBundle');

            throw new ProjectAccessDeniedException($error);
        }

        $isMultiConsultation = $step->isMultiConsultation();

        if (!$consultation && $isMultiConsultation) {
            return $this->redirectToRoute('app_project_show_consultations', [
                'stepSlug' => $step->getSlug(),
                'projectSlug' => $project->getSlug(),
            ]);
        }

        // To keep the same old URI to handle consultation show and supporting the new URI for showing a consultation
        // with a slug, we have to handle both case. If the step has only 1 consultation, we should keep the old behaviour
        if ($step->getFirstConsultation()) {
            $consultationSlug = $consultation
                ? $consultation->getSlug()
                : $step->getFirstConsultation()->getSlug();
        } else {
            $consultationSlug = $consultation ? $consultation->getSlug() : null;
        }

        $cstepGlobalId = GlobalId::toGlobalId('ConsultationStep', $step->getId());

        return [
            'project' => $project,
            'currentStep' => $step,
            'consultation' => $consultation ?? $step->getFirstConsultation(),
            'navigationStepProps' => [
                'id' => $cstepGlobalId,
                'consultationSlug' => $consultationSlug,
            ],
            'stepProps' => [
                'id' => $cstepGlobalId,
                'consultationSlug' => $consultationSlug,
                'isMultiConsultation' => $isMultiConsultation,
            ],
        ];
    }

    /**
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/consultations", name="app_project_show_consultations")
     * @Entity("project", class="CapcoAppBundle:Project", options={
     *    "mapping": {"projectSlug": "slug"},
     *    "repository_method"="getOneWithoutVisibility",
     *    "map_method_signature" = true
     * })
     * @Entity("step", class="CapcoAppBundle:Steps\ConsultationStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Consultation:list.html.twig")
     */
    public function showConsultationsAction(Project $project, ConsultationStep $step)
    {
        if (!$step->canDisplay($this->getUser())) {
            $error = $this->translator->trans('project.error.not_found', [], 'CapcoAppBundle');

            throw new ProjectAccessDeniedException($error);
        }

        if (!$step->isMultiConsultation()) {
            return $this->redirectToRoute('app_project_show_consultation', [
                'stepSlug' => $step->getSlug(),
                'projectSlug' => $project->getSlug(),
            ]);
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'stepProps' => [
                'id' => GlobalId::toGlobalId('ConsultationStep', $step->getId()),
            ],
        ];
    }
}
