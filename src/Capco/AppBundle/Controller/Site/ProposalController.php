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

        $votableStep = $serializer->serialize([
            'votableStep' => $firstVotableStep,
        ], 'json', SerializationContext::create()->setGroups(['Steps']));

        $proposalJson = $serializer->serialize(
            ['proposal' => $proposal],
            'json',
            SerializationContext::create()
                ->setSerializeNull(true)
                ->setGroups(['Proposals', 'ProposalResponses', 'UsersInfos', 'UserMedias', 'ProposalUserData'])
        );

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

        $districts = $serializer->serialize([
            'districts' => $em->getRepository('CapcoAppBundle:District')->findAll(),
        ], 'json', SerializationContext::create()->setGroups(['Districts']));

        $themes = $serializer->serialize([
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
        ], 'json', SerializationContext::create()->setGroups(['Themes']));

        $form = $serializer->serialize([
            'form' => $currentStep->getProposalForm(),
        ], 'json', SerializationContext::create()->setGroups(['ProposalForms', 'ProposalResponses', 'Questions']));

        $votes = $serializer->serialize([
            'votes' => $em->getRepository('CapcoAppBundle:ProposalVote')->getVotesForProposal($proposal, 6),
        ], 'json', SerializationContext::create()->setGroups(['ProposalVotes', 'UsersInfos', 'UserMedias']));

        $remainingCredits = $this
            ->get('capco.proposal_votes.resolver')
            ->getCreditsLeftForUser($this->getUser(), $firstVotableStep)
        ;

        $response = $this->render('CapcoAppBundle:Proposal:show.html.twig', [
            'project' => $project,
            'currentStep' => $currentStep,
            'proposalTitle' => $proposal->getTitle(),
            'proposal' => $proposalJson,
            'themes' => $themes,
            'districts' => $districts,
            'form' => $form,
            'votes' => $votes,
            'votableStep' => $votableStep,
            'userHasVote' => $userHasVote,
            'remainingCredits' => $remainingCredits,
        ]);

        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_ANONYMOUSLY')) {
            $response->setPublic();
            $response->setSharedMaxAge(60);
        }

        return $response;
    }
}
