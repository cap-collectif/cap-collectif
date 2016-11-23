<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\Project\ProjectSearchParameters;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\ProjectType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Entity\Project;

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
     * @View(serializerGroups={"Projects", "Steps", "UserVotes", "ThemeDetails", "ProjectType"})
     */
    public function getProjectsAction(ParamFetcherInterface $paramFetcher)
    {
        $shouldLimit = !$paramFetcher->get('limit') && $this->get('capco.toggle.manager')->isActive('projects_form');

        return $this->get('capco.project.search.resolver')
            ->search(ProjectSearchParameters::createFromRequest($paramFetcher, $shouldLimit));
    }

    /**
     * @Post("/projects")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=201, serializerGroups={"ProjectAdmin"})
     */
    public function postProjectAction(Request $request)
    {
        $project = new Project();
        $form = $this->createForm(new ProjectType(), $project);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($project);
        $em->flush();

        return $project;
    }

    /** @Get("/projects/{projectId}/steps")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @View(serializerGroups={"Steps", "Default"})
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
     * @View()
     */
    public function getProjectStatsAction(AbstractStep $step, ParamFetcherInterface $paramFetcher)
    {
        $key = $paramFetcher->get('key');
        $limit = $paramFetcher->get('limit');
        $theme = $paramFetcher->get('theme');
        $district = $paramFetcher->get('district');

        if ($key === 'votes' && $step instanceof CollectStep) {
            throw new BadRequestHttpException('Collect steps have no votes stats.');
        }

        if ($key !== 'votes' && $step instanceof SelectionStep) {
            throw new BadRequestHttpException('Selection steps have no '.$key.' stats.');
        }

        if ($key !== 'votes' && ($theme || $district)) {
            throw new BadRequestHttpException('Only votes stats can be filtered by theme or district.');
        }

        $data = $this->get('capco.project_stats.resolver')
            ->getStatsForStepByKey($step, $key, $limit, $theme, $district)
        ;

        return [
            'data' => $data,
        ];
    }
}
