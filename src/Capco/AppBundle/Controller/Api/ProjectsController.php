<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use FOS\RestBundle\Util\Codes;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\CommentChangedEvent;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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
