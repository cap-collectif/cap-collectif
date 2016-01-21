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
     * @Security("has_role('ROLE_USER')")
     * @Get("/projects/{project_id}/user_votes")
     * @ParamConverter("project", options={"mapping": {"project_id": "id"}})
     * @View(serializerGroups={"ProposalVotes", "Proposals", "Steps", "UsersInfos"})
     */
    public function getUserVotesAction(Project $project)
    {
        $votes = $this
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:ProposalVote')
            ->getVotesForUserInProject($this->getUser(), $project)
        ;

        return [
            'votes' => $votes,
            'count' => count($votes),
        ];
    }
}
