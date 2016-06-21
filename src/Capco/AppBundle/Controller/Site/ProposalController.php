<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use JMS\Serializer\SerializationContext;

class ProposalController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}", name="app_project_show_proposal")
     * @ParamConverter("project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("currentStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("proposal", options={"mapping": {"proposalSlug": "slug"}})
     * @Template("CapcoAppBundle:Proposal:show.html.twig")
     *
     * @param Project     $project
     * @param CollectStep $currentStep
     * @param Proposal    $proposal
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showProposalAction(Project $project, CollectStep $currentStep, Proposal $proposal)
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');

        $firstVotableStep = $this
            ->get('capco.proposal_votes.resolver')
            ->getFirstVotableStepForProposal($proposal)
        ;

        $userHasVote = false;
        if ($this->getUser() && $firstVotableStep) {
            $userVote = $em
                ->getRepository('CapcoAppBundle:ProposalVote')
                ->findOneBy(
                    [
                        'selectionStep' => $firstVotableStep,
                        'user' => $this->getUser(),
                        'proposal' => $proposal,
                    ]
                );
            if ($userVote !== null) {
                $userHasVote = true;
            }
        }

        $props = $serializer->serialize([
            'proposal' => $proposal,
            'votes' => $em->getRepository('CapcoAppBundle:ProposalVote')->getVotesForProposal($proposal, 6),
            'form' => $currentStep->getProposalForm(),
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
            'districts' => $em->getRepository('CapcoAppBundle:District')->findAll(),
            'votableStep' => $firstVotableStep,
            'userHasVote' => $userHasVote,
        ], 'json', SerializationContext::create()
            ->setSerializeNull(true)
            ->setGroups([
                'ProposalVotes',
                'UsersInfos', 'UserMedias',
                'ProposalForms',
                'Questions',
                'Themes',
                'Districts',
                'Proposals',
                'ProposalUserData',
                'Steps',
                'UserVotes',
            ]))
        ;

        $response = $this->render('CapcoAppBundle:Proposal:show.html.twig', [
            'project' => $project,
            'currentStep' => $currentStep,
            'proposalTitle' => $proposal->getTitle(),
            'props' => $props,
        ]);

        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_ANONYMOUSLY')) {
            $response->setPublic();
            $response->setSharedMaxAge(60);
        }

        return $response;
    }
}
