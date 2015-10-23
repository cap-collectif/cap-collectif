<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Proposal;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Response;


class ProposalController
{
    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalId}")
     * @ParamConverter("proposal", options={"mapping": {"proposalId": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @param Proposal $proposal
     * @return Proposal
     */
    public function showProposalAction(Proposal $proposal)
    {
        return new Response($proposal);
    }
}
