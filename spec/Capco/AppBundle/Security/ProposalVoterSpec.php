<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Security\ProposalVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProposalVoterSpec extends ObjectBehavior
{
    public function it_is_initalizable(): void
    {
        $this->shouldHaveType(ProposalVoter::class);
    }

    public function it_does_not_support_other_things(
        Proposal $subject,
        TokenInterface $token,
        ProposalForm $anything
    ): void {
        $this->vote($token, $subject, ['wrongAttribute'])->shouldReturn(
            ProposalVoter::ACCESS_ABSTAIN
        );
        $this->vote($token, $anything, [ProposalVoter::CHANGE_CONTENT])->shouldReturn(
            ProposalVoter::ACCESS_ABSTAIN
        );
    }

    public function it_forbid_anonymous_to_do_anything(
        Proposal $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.')
        ;
        $this->vote($token, $subject, [ProposalVoter::CHANGE_CONTENT])->shouldReturn(
            ProposalVoter::ACCESS_DENIED
        );
        $this->vote($token, $subject, [ProposalVoter::CHANGE_STATUS])->shouldReturn(
            ProposalVoter::ACCESS_DENIED
        );
    }

    public function it_allow_admin_and_owner_to_change_content(
        Proposal $subject,
        TokenInterface $token,
        User $admin,
        Project $project
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($admin)
        ;
        $subject->getProject()->willReturn($project);
        $admin->isAdmin()->willReturn(true);
        $this->vote($token, $subject, [ProposalVoter::CHANGE_CONTENT])->shouldReturn(
            ProposalVoter::ACCESS_GRANTED
        );
    }

    public function it_allow_admin_and_owner_to_change_status(
        Proposal $subject,
        TokenInterface $token,
        User $admin,
        Project $project
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($admin)
        ;
        $subject->getProject()->willReturn($project);
        $admin->isAdmin()->willReturn(true);
        $this->vote($token, $subject, [ProposalVoter::CHANGE_STATUS])->shouldReturn(
            ProposalVoter::ACCESS_GRANTED
        );
    }

    public function it_allow_author_to_change_content(
        Proposal $subject,
        TokenInterface $token,
        User $author,
        Project $project
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($author)
        ;
        $subject
            ->viewerCanUpdate($author)
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $subject
            ->canContribute($author)
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $subject->getProject()->willReturn($project);
        $author->isAdmin()->willReturn(false);
        $this->vote($token, $subject, [ProposalVoter::CHANGE_CONTENT])->shouldReturn(
            ProposalVoter::ACCESS_GRANTED
        );
    }

    public function it_forbid_author_to_change_status(
        Proposal $subject,
        TokenInterface $token,
        User $author,
        Project $project
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($author)
        ;
        $subject->getProject()->willReturn($project);
        $author->isAdmin()->willReturn(false);
        $this->vote($token, $subject, [ProposalVoter::CHANGE_STATUS])->shouldReturn(
            ProposalVoter::ACCESS_DENIED
        );
    }

    public function it_forbid_others_to_do_anything(
        Proposal $subject,
        TokenInterface $token,
        User $viewer,
        Project $project
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;
        $subject
            ->viewerCanUpdate($viewer)
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $subject->getProject()->willReturn($project);
        $viewer->isAdmin()->willReturn(false);
        $this->vote($token, $subject, [ProposalVoter::CHANGE_CONTENT])->shouldReturn(
            ProposalVoter::ACCESS_DENIED
        );
        $this->vote($token, $subject, [ProposalVoter::CHANGE_STATUS])->shouldReturn(
            ProposalVoter::ACCESS_DENIED
        );
    }
}
