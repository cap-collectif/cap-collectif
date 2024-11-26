<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Command\CreateCsvFromProposalStepCommand;
use Capco\AppBundle\Command\ExportAnalysisCSVCommand;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Form\ProjectSearchType;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProjectController extends Controller
{
    protected RouterInterface $router;
    private readonly TranslatorInterface $translator;
    private readonly string $exportDir;
    private readonly SiteParameterResolver $siteParameterResolver;
    private readonly ProjectUrlResolver $projectUrlResolver;
    private readonly QuestionnaireExportResultsUrlResolver $questionnaireExportResultsUrlResolver;
    private readonly ProjectRepository $projectRepository;
    private readonly OpinionRepository $opinionRepository;
    private readonly OpinionVersionRepository $opinionVersionRepository;
    private readonly ArgumentRepository $argumentRepository;
    private readonly SourceRepository $sourceRepository;
    private readonly PostRepository $postRepository;
    private readonly ContributionResolver $contributionResolver;
    private readonly ProjectHelper $projectHelper;
    private readonly DebateArgumentRepository $debateArgumentRepository;
    private readonly AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        TranslatorInterface $translator,
        RouterInterface $router,
        ProjectUrlResolver $projectUrlResolver,
        SiteParameterResolver $siteParameterResolver,
        ProjectRepository $projectRepository,
        OpinionRepository $opinionRepository,
        OpinionVersionRepository $opinionVersionRepository,
        ArgumentRepository $argumentRepository,
        SourceRepository $sourceRepository,
        ContributionResolver $contributionResolver,
        ProjectHelper $projectHelper,
        PostRepository $postRepository,
        QuestionnaireExportResultsUrlResolver $questionnaireExportResultsUrlResolver,
        string $exportDir,
        DebateArgumentRepository $debateArgumentRepository,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->translator = $translator;
        $this->router = $router;
        $this->exportDir = $exportDir;
        $this->projectUrlResolver = $projectUrlResolver;
        $this->siteParameterResolver = $siteParameterResolver;
        $this->projectRepository = $projectRepository;

        $this->postRepository = $postRepository;
        $this->contributionResolver = $contributionResolver;
        $this->projectHelper = $projectHelper;
        $this->opinionRepository = $opinionRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->argumentRepository = $argumentRepository;
        $this->sourceRepository = $sourceRepository;
        $this->questionnaireExportResultsUrlResolver = $questionnaireExportResultsUrlResolver;
        $this->debateArgumentRepository = $debateArgumentRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    /**
     * @Template("@CapcoApp/Project/lastProjects.html.twig")
     */
    public function lastProjectsAction(int $max = 4, int $offset = 0)
    {
        $props = $this->get('serializer')->serialize(
            [
                'projects' => $this->projectRepository->getLastPublished(
                    $max,
                    $offset,
                    $this->getUser()
                ),
            ],
            'json',
            ['Projects', 'Steps', 'UserDetails', 'StepTypes', 'ThemeDetails', 'ProjectType']
        );

        return ['props' => $props];
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Route("/projects/{projectSlug}/votes", name="app_project_show_user_votes")
     * @Entity("project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("@CapcoApp/Project/show_user_votes.html.twig")
     */
    public function showUserVotesAction(Project $project)
    {
        return ['project' => $project];
    }

    /**
     * @Route("/projects/{projectSlug}/trashed", name="app_project_show_trashed", defaults={"_feature_flags" = "project_trash"} )
     * @Route("/consultations/{projectSlug}/trashed", name="app_consultation_show_trashed", defaults={"_feature_flags" = "project_trash"} )
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("@CapcoApp/Project/show_trashed.html.twig")
     */
    public function showTrashedAction(Project $project)
    {
        if (!$project->viewerCanSee($this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('project.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new ProjectAccessDeniedException($this->translator->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $opinions = $this->opinionRepository->getTrashedByProject($project);
        $versions = $this->opinionVersionRepository->getTrashedByProject($project);
        $arguments = $this->argumentRepository->getTrashedByProject($project);
        $debateArguments = $this->debateArgumentRepository->getTrashedByProject($project);
        $sources = $this->sourceRepository->getTrashedByProject($project);

        return [
            'project' => $project,
            'opinions' => $opinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'debateArguments' => $debateArguments,
            'sources' => $sources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/questionnaires/{questionnaireId}/download", name="app_questionnaire_download", options={"i18n" = false})
     * @Entity("questionnaire", class="CapcoAppBundle:Questionnaire", options={"mapping": {"questionnaireId": "id"}})
     */
    public function downloadQuestionnaireAction(Request $request, Questionnaire $questionnaire)
    {
        $this->denyAccessUnlessGranted(QuestionnaireVoter::EDIT, $questionnaire);

        $isProjectAdmin = $this->getUser()->isOnlyProjectAdmin();
        $filePath = $this->questionnaireExportResultsUrlResolver->getFilePath(
            $questionnaire,
            $isProjectAdmin
        );
        $fileName = $this->questionnaireExportResultsUrlResolver->getFileName(
            $questionnaire,
            $isProjectAdmin
        );

        try {
            $response = $this->file($filePath, $fileName);
            $response->headers->set('Content-Type', 'application/vnd.ms-excel' . '; charset=utf-8');

            return $response;
        } catch (FileNotFoundException $exception) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $this->translator->trans('project.download.not_yet_generated')
            );

            return $this->redirect($request->headers->get('referer'));
        }
    }

    /**
     * @Route("/projects/{projectSlug}/step/{stepSlug}/download", name="app_project_download", options={"i18n" = false})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Entity("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function downloadAction(Request $request, Project $project, AbstractStep $step)
    {
        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $project);
        $user = $this->getUser();
        $isProjectAdmin = $user->isOnlyProjectAdmin();

        $filenameCsv = CreateCsvFromProposalStepCommand::getFilename(
            $step,
            '.csv',
            $isProjectAdmin
        );

        $filenameXlsx = CreateCsvFromProposalStepCommand::getFilename($step, '.xlsx');

        $isCSV = file_exists($this->exportDir . $filenameCsv);
        $filename = $isCSV ? $filenameCsv : $filenameXlsx;
        $contentType = $isCSV ? 'text/csv' : 'application/vnd.ms-excel';

        try {
            $response = $this->file($this->exportDir . $filename, $filename);
            $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

            return $response;
        } catch (FileNotFoundException $exception) {
            return new JsonResponse(
                ['errorTranslationKey' => 'project.download.not_yet_generated'],
                404
            );
        }
    }

    /**
     * Legacy URL to avoid 404s.
     *
     * @Route("/projects/{projectSlug}/events", name="app_project_show_events", defaults={"_feature_flags" = "calendar"})
     * @Route("/consultations/{projectSlug}/events", name="app_consultation_show_events", defaults={"_feature_flags" = "calendar"})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     */
    public function showEventsAction(Project $project)
    {
        return new RedirectResponse(
            $this->generateUrl('app_event') .
                '?projectId=' .
                GlobalId::toGlobalId('Project', $project->getId())
        );
    }

    /**
     * @Route("/projects/{projectSlug}/posts/{page}", name="app_project_show_posts", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @Route("/consultations/{projectSlug}/posts/{page}", name="app_consultation_show_posts", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("@CapcoApp/Project/show_posts.html.twig")
     *
     * @param mixed $page
     */
    public function showPostsAction(Project $project, $page)
    {
        $pagination = $this->siteParameterResolver->getValue('blog.pagination.size');

        $posts = $this->postRepository->getSearchResults(
            $pagination,
            $page,
            null,
            $project->getSlug(),
            null,
            $this->getUser()
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 !== $pagination) {
            $nbPage = ceil(\count($posts) / $pagination);
        }

        return [
            'project' => $project,
            'posts' => $posts,
            'page' => $page,
            'nbPage' => $nbPage,
            'currentStep' => 'posts_step',
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/participants/{page}", name="app_project_show_contributors", requirements={"page" = "\d+"}, defaults={"page" = 1}, options={"i18n" = true})
     * @Route("/consultations/{projectSlug}/participants/{page}", name="app_consultation_show_contributors",
     *    requirements={"page" = "\d+"}, defaults={"page" = 1}, options={"i18n" = true})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("@CapcoApp/Project/show_contributors.html.twig")
     *
     * @param mixed $page
     */
    public function showContributorsAction(Project $project, $page)
    {
        $pagination = $this->siteParameterResolver->getValue('contributors.pagination');

        $contributors = $this->contributionResolver->getProjectContributorsOrdered(
            $project,
            true,
            $pagination,
            $page
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 !== $pagination) {
            $nbPage = ceil(\count($contributors) / $pagination);
        }

        $showVotes = $this->projectHelper->hasStepWithVotes($project);

        return [
            'project' => $project,
            'contributors' => $contributors,
            'page' => $page,
            'pagination' => $pagination,
            'nbPage' => $nbPage,
            'currentStep' => 'contributors_step',
            'showVotes' => $showVotes,
        ];
    }

    /**
     * @Route("/projects", name="app_project", options={"i18n" = true})
     * @Template("@CapcoApp/Project/index.html.twig")
     */
    public function indexAction(Request $request)
    {
        $parameters = [];
        $form = $this->createForm(ProjectSearchType::class);
        $form->submit($request->query->all());

        if ($form->isValid()) {
            $parameters = $form->getData();
            $parameters['type'] = $parameters['type'] ? $parameters['type']->getId() : null;

            if (isset($parameters['theme'])) {
                $parameters['theme'] = $parameters['theme'] ? $parameters['theme']->getId() : null;
            }
        }

        $limit = (int) $this->siteParameterResolver->getValue('projects.pagination');

        return ['params' => $parameters, 'limit' => $limit];
    }

    /**
     * @Route("/projects/archived", name="app_project_archived", options={"i18n" = true})
     * @Template("@CapcoApp/Project/index.html.twig")
     */
    public function indexArchivedAction(Request $request)
    {
        $parameters = [];
        $form = $this->createForm(ProjectSearchType::class);
        $form->submit($request->query->all());

        if ($form->isValid()) {
            $parameters = $form->getData();
            $parameters['type'] = $parameters['type'] ? $parameters['type']->getId() : null;

            if (isset($parameters['theme'])) {
                $parameters['theme'] = $parameters['theme'] ? $parameters['theme']->getId() : null;
            }
        }

        $parameters['archived'] = 'archived';

        $limit = (int) $this->siteParameterResolver->getValue('projects.pagination');

        return ['params' => $parameters, 'limit' => $limit];
    }

    /**
     * @Route("/admin/capco/app/project/{projectId}/preview", name="capco_admin_project_preview", options={"i18n" = false})
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     */
    public function previewAction(Request $request, Project $project): Response
    {
        return new RedirectResponse($this->projectUrlResolver->__invoke($project));
    }

    /**
     * @Route("/projects/{projectSlug}/analysis/download", name="app_project_analysis_download", options={"i18n" = false})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     */
    public function downloadProjectAnalysisAction(Request $request, Project $project)
    {
        if (!$this->authorizationChecker->isGranted(ProjectVoter::EXPORT, $project)) {
            throw new ProjectAccessDeniedException($this->translator->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $isProjectAdmin = $this->getUser()->isOnlyProjectAdmin();

        $filename = ExportAnalysisCSVCommand::getFilename(
            $project->getSlug(),
            false,
            $isProjectAdmin
        );
        $contentType = 'text/csv';
        $fullPath = $this->exportDir . $filename;

        try {
            $response = $this->file($fullPath, $filename);
            $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

            return $response;
        } catch (FileNotFoundException $exception) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $this->translator->trans('project.download.not_yet_generated')
            );

            $referer = $request->headers->get('referer');
            $homePageUrl = $this->router->generate('app_homepage');

            return $this->redirect($referer ?? $homePageUrl);
        }
    }

    /**
     * @Route("/projects/{projectSlug}/decisions/download", name="app_project_decisions_download", options={"i18n" = false})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     */
    public function downloadProjectDecisionAction(Request $request, Project $project)
    {
        if (!$this->authorizationChecker->isGranted(ProjectVoter::EXPORT, $project)) {
            throw new ProjectAccessDeniedException($this->translator->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $isProjectAdmin = $this->getUser()->isOnlyProjectAdmin();

        $filename = ExportAnalysisCSVCommand::getFilename(
            $project->getSlug(),
            true,
            $isProjectAdmin
        );
        $contentType = 'text/csv';

        try {
            $response = $this->file($this->exportDir . $filename, $filename);
            $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

            return $response;
        } catch (FileNotFoundException $exception) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $this->translator->trans('project.download.not_yet_generated')
            );

            $referer = $request->headers->get('referer');
            $homePageUrl = $this->router->generate('app_homepage');

            return $this->redirect($referer ?? $homePageUrl);
        }
    }
}
