<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\CollectStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use JMS\Serializer\SerializationContext;

class ProposalController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalId}")
     * @ParamConverter("project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("currentStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("proposal", options={"mapping": {"proposalId": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @Template("CapcoAppBundle:Proposal:show.html.twig")
     */
    public function showProposalAction(Project $project, CollectStep $currentStep, Proposal $proposal)
    {
        $serializer = $this->get('jms_serializer');

        $json = $serializer->serialize([
            'proposal' => $proposal,
        ], 'json', SerializationContext::create()->setGroups(["Proposals", "ProposalResponses", "UsersInfos", "UserMedias"]));

        return [
            'project' => $project,
            'currentStep' => $currentStep,
            'proposal' => $proposal,
            'json' => $json,
        ];
    }
}
