<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Security\ProposalAnalysisCommentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class ProposalAnalysisCommentVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalAnalysisCommentVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        ProposalAnalysisComment $comment,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $comment, [ProposalAnalysisCommentVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_analyst_to_create_a_comment(
        ProposalAnalysisComment $comment,
        TokenInterface $token,
        User $viewer,
        Proposal $proposal,
        ProposalAnalysis $proposalAnalysis
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);

        $comment->getProposalAnalysis()->willReturn($proposalAnalysis);
        $proposalAnalysis->getProposal()->willReturn($proposal);

        $analysts = new ArrayCollection([$viewer->getWrappedObject()]);

        $proposal->getAnalysts()->willReturn($analysts);

        $this->vote($token, $comment, [ProposalAnalysisCommentVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_supervisor_to_create_a_comment(
        ProposalAnalysisComment $comment,
        TokenInterface $token,
        User $viewer,
        Proposal $proposal,
        ProposalAnalysis $proposalAnalysis,
        User $otherAnalyst
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);

        $comment->getProposalAnalysis()->willReturn($proposalAnalysis);
        $proposalAnalysis->getProposal()->willReturn($proposal);

        $analysts = new ArrayCollection([$otherAnalyst]);
        $proposal->getAnalysts()->willReturn($analysts);

        $proposal->getSupervisor()->willReturn($viewer);

        $this->vote($token, $comment, [ProposalAnalysisCommentVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_decision_maker_to_create_a_comment(
        ProposalAnalysisComment $comment,
        TokenInterface $token,
        User $viewer,
        Proposal $proposal,
        ProposalAnalysis $proposalAnalysis,
        User $otherAnalyst,
        User $supervisor
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);

        $comment->getProposalAnalysis()->willReturn($proposalAnalysis);
        $proposalAnalysis->getProposal()->willReturn($proposal);

        $analysts = new ArrayCollection([$otherAnalyst]);
        $proposal->getAnalysts()->willReturn($analysts);
        $proposal->getSupervisor()->willReturn($supervisor);
        $proposal->getDecisionMaker()->willReturn($viewer);

        $this->vote($token, $comment, [ProposalAnalysisCommentVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }
}
