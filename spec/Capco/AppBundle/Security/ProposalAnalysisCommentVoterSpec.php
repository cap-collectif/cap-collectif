<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
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

        $proposalAnalysis->getConcernedUsers()->shouldBeCalledOnce()->willReturn(new ArrayCollection([$viewer->getWrappedObject()]));

        $this->vote($token, $comment, [ProposalAnalysisCommentVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }
}
