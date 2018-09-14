<?php
namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Form\ProjectType;
use Capco\AppBundle\Resolver\Project\ProjectSearchParameters;
use Capco\AppBundle\Resolver\Project\ProjectSearchResolver;
use Capco\AppBundle\Resolver\ProjectStatsResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Toggle\Manager;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectsController extends FOSRestController
{
    /**
     * @Get("/projects")
     * @QueryParam(name="limit", requirements="\d+", nullable=true)
     * @QueryParam(name="page", requirements="\d+", nullable=true)
     * @QueryParam(name="theme", requirements="[a-z0-9]+(?:-[a-z0-9]+)*", default="all")
     * @QueryParam(name="orderBy", requirements="(date|popularity)", default="date")
     * @QueryParam(name="type", requirements="[a-z0-9]+(?:-[a-z0-9]+)*", nullable=true)
     * @QueryParam(name="term", nullable=true)
     * @View(serializerGroups={"Projects", "Steps", "UserDetails", "UserVotes", "ThemeDetails", "ProjectType"})
     * @Cache(smaxage="60", public=true)
     */
    public function getProjectsAction(ParamFetcherInterface $paramFetcher)
    {
        $shouldLimit =
            !$paramFetcher->get('limit') && $this->get(Manager::class)->isActive('projects_form');
        $projectSearchParameters = ProjectSearchParameters::createFromRequest(
            $paramFetcher,
            $shouldLimit
        );
        if (
            $shouldLimit &&
            !$paramFetcher->get('limit') &&
            $this->get(Manager::class)->isActive('projects_form')
        ) {
            $projectSearchParameters->setElements(
                $this->get(Resolver::class)->getValue('projects.pagination')
            );
        }

        return $this->get(ProjectSearchResolver::class)->search(
            $projectSearchParameters,
            $this->getUser()
        );
    }

    /**
     * @Post("/projects")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=201, serializerGroups={"ProjectAdmin"})
     */
    public function postProjectAction(Request $request)
    {
        $project = new Project();
        $form = $this->createForm(ProjectType::class, $project);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        // We make sure the author can edit his project
        $author = $project->getAuthor();
        $author->addRole('ROLE_ADMIN');

        $em = $this->getDoctrine()->getManager();
        $em->persist($project);
        $em->flush();

        $this->get('capco.project_notifier')->onCreate($project);

        return $project;
    }

    /**
     * @Get("/projects/{projectId}/steps")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @View(serializerGroups={"Steps", "Default", "Statuses"})
     */
    public function getProjectStepsAction(Project $project)
    {
        return $project->getSteps()->map(function ($step) {
            return $step->getStep();
        });
    }

    /**
     * @Get("/project_stats/{step_id}")
     * @ParamConverter("step", options={"mapping": {"step_id": "id"}})
     * @QueryParam(name="key", requirements="themes|districts|userTypes|costs|votes")
     * @QueryParam(name="limit", requirements="[0-9.]+", default=0)
     * @QueryParam(name="theme", default=null)
     * @QueryParam(name="district", default=null)
     * @QueryParam(name="category", default=null)
     * @View()
     */
    public function getProjectStatsAction(AbstractStep $step, ParamFetcherInterface $paramFetcher)
    {
        $key = $paramFetcher->get('key');
        $limit = $paramFetcher->get('limit');
        $theme = $paramFetcher->get('theme');
        $district = $paramFetcher->get('district');
        $category = $paramFetcher->get('category');

        if ('votes' === $key && $step instanceof CollectStep) {
            throw new BadRequestHttpException('Collect steps have no votes stats.');
        }

        if ('votes' !== $key && $step instanceof SelectionStep) {
            throw new BadRequestHttpException('Selection steps have no ' . $key . ' stats.');
        }

        if ('votes' !== $key && (null !== $theme || null !== $district)) {
            $theme = null;
            $district = null;
            // throw new BadRequestHttpException('Only votes stats can be filtered by theme or district.');
        }

        $data = $this->get(ProjectStatsResolver::class)->getStatsForStepByKey(
            $step,
            $key,
            $limit,
            $theme,
            $district,
            $category
        );
        return ['data' => $data];
    }

    /**
     * @Get("/projects/{projectId}")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @View(serializerGroups={"Projects", "Default"})
     */
    public function getProjectAction(Project $project)
    {
        return $project;
    }
}
