<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Form\ProjectSearchType;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Resolver\ContributionResolver;
use Capco\AppBundle\Resolver\EventResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class ProjectController extends Controller
{
    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Project:lastProjects.html.twig")
     *
     * @param mixed $max
     * @param mixed $offset
     */
    public function lastProjectsAction($max = 4, $offset = 0)
    {
        $props = $this->get('jms_serializer')->serialize(
            [
                'projects' => $this->get(
                    'Capco\AppBundle\Repository\ProjectRepository'
                )->getLastPublished($max, $offset, $this->getUser()),
            ],
            'json',
            SerializationContext::create()->setGroups([
                'Projects',
                'Steps',
                'UserDetails',
                'StepTypes',
                'ThemeDetails',
                'ProjectType',
            ])
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
     * @Cache(smaxage="60", public="true")
     * @Template("CapcoAppBundle:Project:show_stats.html.twig")
     */
    public function showStatsAction(Project $project)
    {
        $serializer = $this->get('serializer');

        $steps = $this->get(
            'Capco\AppBundle\Resolver\ProjectStatsResolver'
        )->getStepsWithStatsForProject($project);
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
     *
     * @param Project $project
     *
     * @return array
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

        $em = $this->getDoctrine()->getManager();

        $opinions = $this->get('capco.opinion.repository')->getTrashedByProject($project);
        $versions = $this->get('capco.opinion_version.repository')->getTrashedByProject($project);
        $arguments = $this->get('capco.argument.repository')->getTrashedByProject($project);
        $sources = $this->get('capco.source.repository')->getTrashedByProject($project);

        $proposals = $this->get('capco.proposal.repository')->getTrashedByProject($project);

        return [
            'project' => $project,
            'opinions' => $opinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'sources' => $sources,
            'proposals' => $proposals,
            'argumentsLabels' => Argument::$argumentTypesLabels,
            'currentStep' => 'trash_step',
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/step/{stepSlug}/download", name="app_project_download")
     * @Security("has_role('ROLE_ADMIN')")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={"mapping": {"stepSlug": "slug"}})
     */
    public function downloadAction(Request $request, Project $project, AbstractStep $step)
    {
        $trans = $this->get('translator');

        if (
            !$project->isExportable() &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new ProjectAccessDeniedException(
                $trans->trans('project.error.not_exportable', [], 'CapcoAppBundle')
            );
        }

        $path = sprintf('%s/web/export/', $this->container->getParameter('kernel.project_dir'));
        $filename = '';
        if ($step->getProject()) {
            $filename .= $step->getProject()->getSlug() . '_';
        }
        $filename .= $step->getSlug();

        $csvFile = $filename . '.csv';
        $xlsxFile = $filename . '.xlsx';

        if (!file_exists($path . $csvFile) && !file_exists($path . $xlsxFile)) {
            $this->get('session')
                ->getFlashBag()
                ->add(
                    'danger',
                    $trans->trans('project.download.not_yet_generated', [], 'CapcoAppBundle')
                );

            return $this->redirect($request->headers->get('referer'));
        }

        $filename = file_exists($path . $csvFile) ? $csvFile : $xlsxFile;
        $contentType = file_exists($path . $csvFile) ? 'text/csv' : 'application/vnd.ms-excel';

        $date = (new \DateTime())->format('Y-m-d');

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new BinaryFileResponse($path . $filename);
        $response->headers->set('X-Accel-Redirect', '/export/' . $filename);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $date . '_' . $filename
        );
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }

    /**
     * @Route("/projects/{projectSlug}/events", name="app_project_show_events", defaults={"_feature_flags" = "calendar"})
     * @Route("/consultations/{projectSlug}/events", name="app_consultation_show_events", defaults={"_feature_flags" = "calendar"})
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_events.html.twig")
     */
    public function showEventsAction(Project $project)
    {
        $groupedEvents = $this->get(
            'Capco\AppBundle\Resolver\EventResolver'
        )->getEventsGroupedByYearAndMonth(null, null, $project->getSlug(), null);
        $nbEvents = $this->get(EventResolver::class)->countEvents(
            null,
            null,
            $project->getSlug(),
            null
        );

        return [
            'project' => $project,
            'years' => $groupedEvents,
            'nbEvents' => $nbEvents,
            'currentStep' => 'events_step',
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/posts/{page}", name="app_project_show_posts", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @Route("/consultations/{projectSlug}/posts/{page}", name="app_consultation_show_posts", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_posts.html.twig")
     *
     * @param $page
     * @param $project
     *
     * @return array
     */
    public function showPostsAction(Project $project, $page)
    {
        $pagination = $this->get(Resolver::class)->getValue('blog.pagination.size');

        $posts = $this->get('capco.blog.post.repository')->getSearchResults(
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
            'currentStep' => 'posts_step',
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/participants/{page}", name="app_project_show_contributors", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/consultations/{projectSlug}/participants/{page}", name="app_consultation_show_contributors", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Template("CapcoAppBundle:Project:show_contributors.html.twig")
     * @Cache(smaxage="120", public=true)
     *
     * @param mixed $page
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
            'showVotes' => $showVotes,
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
                $parameters['theme'] = $parameters['theme']
                    ? $parameters['theme']->getId()
                    : null;
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
}
