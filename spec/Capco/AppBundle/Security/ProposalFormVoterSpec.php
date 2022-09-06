<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Security\ProposalFormVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

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

        $this->vote($token, $subject, [ProposalFormVoter::CREATE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::EDIT])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::VIEW])->shouldBe(1);
        $this->vote($token, $subject, [ProposalFormVoter::DUPLICATE])->shouldBe(1);
    }

    public function it_allow_organization_member_to_create_edit_view_duplicate(
        ProposalForm $subject,
        TokenInterface $token,
        User $user,
        Organization $organization,
        OrganizationMember $memberShip
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
            ->willReturn(false);
        $user
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn(new ArrayCollection([$organization]));
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $subject
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->vote($token, $subject, [ProposalFormVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [ProposalFormVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [ProposalFormVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [ProposalFormVoter::DUPLICATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_creator_member_to_delete(
        ProposalForm $subject,
        TokenInterface $token,
        User $user,
        Organization $organization,
        OrganizationMember $memberShip
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $subject
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($user);

        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_organization_admin_to_delete(
        ProposalForm $subject,
        TokenInterface $token,
        User $user,
        Organization $organization,
        OrganizationMember $memberShip
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::ADMIN);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);

        $this->vote($token, $subject, [ProposalFormVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
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
