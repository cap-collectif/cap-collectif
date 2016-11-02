<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectsController extends FOSRestController
{
    /**
     * @Get("/projects/{project_id}/votable_steps")
     * @ParamConverter("project", options={"mapping": {"project_id": "id"}})
     * @View(serializerGroups={"Steps", "UserVotes"})
     */
    public function getVotableStepsAction(Project $project)
    {
        $votableSteps = $this
            ->get('capco.proposal_votes.resolver')
            ->getVotableStepsForProject($project)
        ;

        return [
            'votableSteps' => $votableSteps,
        ];
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
