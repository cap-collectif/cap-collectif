<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use JMS\Serializer\SerializationContext;
use Doctrine\Common\Collections\ArrayCollection;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;

class ProposalController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}", name="app_project_show_proposal")
     * @ParamConverter("project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("currentStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("proposal", options={"mapping": {"proposalSlug": "slug"}})
     * @Template("CapcoAppBundle:Proposal:show.html.twig")
     * @Cache(smaxage="60", public=true)
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
                ->getRepository('CapcoAppBundle:ProposalSelectionVote')
                ->findOneBy([
                    'selectionStep' => $firstVotableStep,
                    'user' => $this->getUser(),
                    'proposal' => $proposal,
                ]);
            if ($userVote) {
                $userHasVote = true;
            }
        }

        $proposalForm = $currentStep->getProposalForm();
        $props = $serializer->serialize([
            'form' => $proposalForm,
            'categories' => $proposalForm ? $proposalForm->getCategories() : [],
            'votableStep' => $firstVotableStep,
        ], 'json', SerializationContext::create()
            ->setSerializeNull(true)
            ->setGroups([
                'ProposalCategories',
                'UserVotes',
                'ProposalForms',
                'Questions',
                'Steps',
                'ThemeDetails',
                'UserMedias',
                'VoteThreshold',
                'Default', // force step_type serialization
            ]))
        ;

        $previewedSelectionVotes = $this->getDoctrine()->getRepository(ProposalSelectionVote::class)->getVotesForProposalByStepId($proposal, $currentStep->getId(), 6);
        $proposal->setSelectionVotes(new ArrayCollection($previewedSelectionVotes));

        $previewedCollectVotes = $this->getDoctrine()->getRepository(ProposalCollectVote::class)->getVotesForProposalByStepId($proposal, $currentStep->getId(), 6);
        $proposal->setCollectVotes(new ArrayCollection($previewedCollectVotes));

        $proposalSerialized = $serializer->serialize($proposal, 'json',
          SerializationContext::create()
            ->setSerializeNull(true)
            ->setGroups([
                'ProposalSelectionVotes',
                'ProposalCollectVotes',
                'UsersInfos',
                'UserMedias',
                'Proposals',
                'ProposalCategories',
                'ThemeDetails',
                'ProposalUserData',
                'VoteThreshold',
            ]))
        ;

        $proposalSerializedAsArray = json_decode($proposalSerialized, true);
        $proposalSerializedAsArray['postsCount'] = $em->getRepository('CapcoAppBundle:Post')->countPublishedPostsByProposal($proposal);

        return $this->render('CapcoAppBundle:Proposal:show.html.twig', [
            'project' => $project,
            'currentStep' => $currentStep,
            'props' => $props,
            'proposal' => $proposal,
            'proposalSerialized' => $proposalSerializedAsArray,
        ]);
    }
}
