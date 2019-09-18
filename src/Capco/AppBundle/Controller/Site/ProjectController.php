<?php

namespace Capco\AppBundle\Controller\Site;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Form\ProjectSearchType;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Resolver\ProjectStatsResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Symfony\Component\HttpFoundation\Response;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException;

class ProjectController extends Controller
{
    /**
     * @Template("CapcoAppBundle:Project:lastProjects.html.twig")
     */
    public function lastProjectsAction(int $max = 4, int $offset = 0)
    {
        $props = $this->get('serializer')->serialize(
            [
                'projects' => $this->get(ProjectRepository::class)->getLastPublished(
                    $max,
                    $offset,
                    $this->getUser()
                )
            ],
            'json',
            ['Projects', 'Steps', 'UserDetails', 'StepTypes', 'ThemeDetails', 'ProjectType']
        );

        return ['props' => $props];
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Route("/projects/{projectSlug}/votes", name="app_project_show_user_votes")
     * @ParamConverter("project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_user_votes.html.twig")
     */
    public function showUserVotesAction(Project $project)
    {
        return ['project' => $project];
    }

    /**
     * @Route("/projects/{projectSlug}/stats", name="app_project_show_stats")
     * @ParamConverter("project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_stats.html.twig")
     */
    public function showStatsAction(Project $project)
    {
        $serializer = $this->get('serializer');

        $steps = $this->get(ProjectStatsResolver::class)->getStepsWithStatsForProject($project);
        $props = $serializer->serialize(
            ['projectId' => $project->getId(), 'steps' => $steps],
            'json'
        );

        return ['project' => $project, 'props' => $props, 'currentStep' => 'stats_step'];
    }

    /**
     * @Route("/projects/{projectSlug}/trashed", name="app_project_show_trashed", defaults={"_feature_flags" = "project_trash"} )
     * @Route("/consultations/{projectSlug}/trashed", name="app_consultation_show_trashed", defaults={"_feature_flags" = "project_trash"} )
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_trashed.html.twig")
     */
    public function showTrashedAction(Project $project)
    {
        if (!$project->canDisplay($this->getUser())) {
            throw $this->createNotFoundException(
                $this->get('translator')->trans('project.error.not_found', [], 'CapcoAppBundle')
            );
        }

        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle')
            );
        }

        $opinions = $this->get(OpinionRepository::class)->getTrashedByProject($project);
        $versions = $this->get(OpinionVersionRepository::class)->getTrashedByProject($project);
        $arguments = $this->get(ArgumentRepository::class)->getTrashedByProject($project);
        $sources = $this->get(SourceRepository::class)->getTrashedByProject($project);

        return [
            'project' => $project,
            'opinions' => $opinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'sources' => $sources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
            'currentStep' => 'trash_step'
        ];
    }

    /**
     * @Route("/questionnaires/{questionnaireId}/download", name="app_questionnaire_download")
     * @Security("has_role('ROLE_ADMIN')")
     * @ParamConverter("questionnaire", class="CapcoAppBundle:Questionnaire", options={"mapping": {"questionnaireId": "id"}})
     */
    public function downloadQuestionnaireAction(Request $request, Questionnaire $questionnaire)
    {
        $filePath = $this->get(QuestionnaireExportResultsUrlResolver::class)->getFilePath(
            $questionnaire
        );
        $fileName = $this->get(QuestionnaireExportResultsUrlResolver::class)->getFileName(
            $questionnaire
        );

        try {
            return $this->streamResponse(
                $request,
                $filePath,
                'application/vnd.ms-excel',
                $fileName
            );
        } catch (FileNotFoundException $exception) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $this->get('translator')->trans('project.download.not_yet_generated')
            );

            return $this->redirect($request->headers->get('referer'));
        }
    }

    /**
     * @Route("/projects/{projectSlug}/step/{stepSlug}/download", name="app_project_download")
     * @Security("has_role('ROLE_ADMIN')")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function downloadAction(Request $request, Project $project, AbstractStep $step)
    {
        $path = sprintf('%s/web/export/', $this->container->getParameter('kernel.project_dir'));
        $filename = '';
        if ($step->getProject()) {
            $filename .= $step->getProject()->getSlug() . '_';
        }
        $filename .= $step->getSlug();

        $csvFile = $filename . '.csv';
        $xlsxFile = $filename . '.xlsx';

        $filename = file_exists($path . $csvFile) ? $csvFile : $xlsxFile;
        $contentType = file_exists($path . $csvFile) ? 'text/csv' : 'application/vnd.ms-excel';

        try {
            return $this->streamResponse($request, $path . $filename, $contentType, $filename);
        } catch (FileNotFoundException $exception) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $this->get('translator')->trans('project.download.not_yet_generated')
            );

            return $this->redirect($request->headers->get('referer'));
        }
    }

    /**
     * Legacy URL to avoid 404s.
     *
     * @Route("/projects/{projectSlug}/events", name="app_project_show_events", defaults={"_feature_flags" = "calendar"})
     * @Route("/consultations/{projectSlug}/events", name="app_consultation_show_events", defaults={"_feature_flags" = "calendar"})
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
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
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_posts.html.twig")
     */
    public function showPostsAction(Project $project, $page)
    {
        $pagination = $this->get(Resolver::class)->getValue('blog.pagination.size');

        $posts = $this->get(PostRepository::class)->getSearchResults(
            $pagination,
            $page,
            null,
            $project->getSlug()
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
            'currentStep' => 'posts_step'
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/participants/{page}", name="app_project_show_contributors", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/consultations/{projectSlug}/participants/{page}", name="app_consultation_show_contributors", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_contributors.html.twig")
     */
    public function showContributorsAction(Project $project, $page)
    {
        $pagination = $this->get(Resolver::class)->getValue('contributors.pagination');

        $contributors = $this->get(ContributionResolver::class)->getProjectContributorsOrdered(
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

        $showVotes = $this->get(ProjectHelper::class)->hasStepWithVotes($project);

        return [
            'project' => $project,
            'contributors' => $contributors,
            'page' => $page,
            'pagination' => $pagination,
            'nbPage' => $nbPage,
            'currentStep' => 'contributors_step',
            'showVotes' => $showVotes
        ];
    }

    /**
     * @Route("/projects", name="app_project")
     * @Template("CapcoAppBundle:Project:index.html.twig")
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

        $limit = (int) $this->get(Resolver::class)->getValue('projects.pagination');

        return ['params' => $parameters, 'limit' => $limit];
    }

    /**
     * @Route("/admin/capco/app/project/{projectId}/preview", name="capco_admin_project_preview")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     */
    public function previewAction(Request $request, Project $project): Response
    {
        $projectUrlResolver = $this->container->get(ProjectUrlResolver::class);

        return new RedirectResponse($projectUrlResolver->__invoke($project));
    }

    /**
     * @throws FileNotFoundException
     */
    private function streamResponse(
        Request $request,
        string $filePath,
        string $contentType,
        string $fileName
    ): BinaryFileResponse {
        $date = (new \DateTime())->format('Y-m-d');

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new BinaryFileResponse($filePath);
        $response->headers->set('X-Accel-Redirect', '/export/' . $fileName);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $date . '_' . $fileName
        );
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }
}
