<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ViewConfiguration;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OtherStepRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\PresentationStepRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Search\OpinionSearch;
use Capco\AppBundle\Search\VersionSearch;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class StepController extends Controller
{
    private TranslatorInterface $translator;
    private SerializerInterface $serializer;
    private OpinionSearch $opinionSearch;
    private VersionSearch $versionSearch;
    private LocaleRepository $localeRepo;

    public function __construct(
        TranslatorInterface $translator,
        SerializerInterface $serializer,
        OpinionSearch $opinionSearch,
        VersionSearch $versionSearch,
        LocaleRepository $localeRepo
    ) {
        $this->translator = $translator;
        $this->serializer = $serializer;
        $this->opinionSearch = $opinionSearch;
        $this->versionSearch = $versionSearch;
        $this->localeRepo = $localeRepo;
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
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/presentation/{stepSlug}", name="app_project_show_presentation")
     * @Template("CapcoAppBundle:Step:presentation.html.twig")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     */
    public function showPresentationAction(Project $project, string $stepSlug, PresentationStepRepository $presentationStepRepository, OtherStepRepository $otherStepRepository)
    {
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
        }
        $projectSlug = $project->getSlug();
        $posts = $this->get(PostRepository::class)->getLastPublishedByProject($projectSlug, 2);
        $nbPosts = $this->get(PostRepository::class)->countSearchResults(null, $projectSlug);
        $showVotes = $this->get(ProjectHelper::class)->hasStepWithVotes($project);

        // after presentation steps migration to other steps the url is now /step/{slug} but we still want to support /presentation/{slug} for old url that have been already shared
        // so we redirect to /step/{slug} if the slug matches other step
        $otherStep = $otherStepRepository->getOneBySlugAndProjectSlug($stepSlug, $projectSlug);

        if ($otherStep) {
            return $this->redirectToRoute('app_project_show_step', [
                'projectSlug' => $projectSlug,
                'stepSlug' => $stepSlug,
            ]);
        }

        $presentationStep = $presentationStepRepository->getOneBySlugAndProjectSlug($stepSlug, $projectSlug);

        return [
            'project' => $project,
            'currentStep' => $presentationStep,
            'posts' => $posts,
            'nbPosts' => $nbPosts,
            'showVotes' => $showVotes,
        ];
    }

    /**
     * @Route("/consultation/{projectSlug}/presentation/{stepSlug}", name="app_consultation_show_presentation")
     */
    public function showPresentationDeprecatedAction(
        string $projectSlug,
        string $stepSlug
    ): RedirectResponse {
        return $this->redirectToRoute(
            'app_project_show_presentation',
            compact('projectSlug', 'stepSlug')
        );
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
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
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
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
        }

        $opinions = $this->opinionSearch
            ->getByCriteriaOrdered(
                [
                    'project.id' => $project->getId(),
                ],
                'popular',
                500
            )
            ->getEntities()
        ;

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
            ->getEntities()
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
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\RankingStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     *
     * @param mixed $page
     */
    public function showOpinionsRankingAction(Project $project, RankingStep $step, $page = 1)
    {
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
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
     *
     * @param mixed $page
     */
    public function showVersionsRankingAction(Project $project, RankingStep $step, $page = 1)
    {
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
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
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
        }

        if (!$step->getProposalForm()) {
            throw $this->createNotFoundException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'isProposalSmsVoteEnabled' => $step->isProposalSmsVoteEnabled(),
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
            return $this->redirect403();
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
                'platformLocale' => $this->localeRepo->getDefaultCode(),
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
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'proposalForm' => null,
            'isProposalSmsVoteEnabled' => $step->isProposalSmsVoteEnabled(),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/vote/{stepSlug}", name="app_project_show_vote")
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\SelectionStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Step:vote.html.twig")
     */
    public function showVoteStepAction(Project $project, SelectionStep $step)
    {
        $viewer = $this->getUser();
        if (!$project->viewerCanSee($viewer)) {
            return $this->redirect403();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'proposalForm' => null,
            'isProposalSmsVoteEnabled' => $step->isProposalSmsVoteEnabled(),
            'isMapView' => ViewConfiguration::MAP === $step->getMainView(),
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

    private function redirect403(): Response
    {
        $viewer = $this->getUser();
        if (!$viewer) {
            return $this->render('@CapcoApp/Project/403_auth.html.twig', [], new Response('', Response::HTTP_FORBIDDEN));
        }

        throw new ProjectAccessDeniedException();
    }
}
