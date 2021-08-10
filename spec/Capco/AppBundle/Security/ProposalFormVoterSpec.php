<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Security\ProposalFormVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProposalFormVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalFormVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        ProposalForm $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $subject, [ProposalFormVoter::CREATE])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::EDIT])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::VIEW])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::DUPLICATE])->shouldBe(-1);
    }

    public function it_forbid_project_admin_to_do_anything_with_someone_else_proposalForm(
        ProposalForm $subject,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $subject->getOwner()->willReturn(null);

        $this->vote($token, $subject, [ProposalFormVoter::CREATE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::EDIT])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::VIEW])->shouldBe(-1);
        $this->vote($token, $subject, [ProposalFormVoter::DUPLICATE])->shouldBe(-1);
    }

    public function it_allow_project_admin_to_do_anything_with_is_proposalForm(
        ProposalForm $subject,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $subject->getOwner()->willReturn($user);

        $this->vote($token, $subject, [ProposalFormVoter::CREATE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::EDIT])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::VIEW])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::DUPLICATE])->shouldBe(1);
    }

    public function it_allow_admin_to_do_anything(
        ProposalForm $subject,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, $subject, [ProposalFormVoter::CREATE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::EDIT])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::VIEW])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::DUPLICATE])->shouldBe(1);
    }

    public function it_does_not_support_other_things(
        ProposalForm $subject,
        Proposal $notProposalForm,
        TokenInterface $token
    ): void {
        $this->vote($token, $subject, ['notexisting'])->shouldBe(0);
        $this->vote($token, $notProposalForm, [ProposalFormVoter::EDIT])->shouldBe(0);
    }
}
