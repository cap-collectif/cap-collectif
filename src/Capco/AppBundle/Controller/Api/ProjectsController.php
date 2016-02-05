<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Project;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;

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
}
