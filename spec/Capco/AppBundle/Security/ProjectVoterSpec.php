<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class ProjectVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProjectVoter::class);
    }

    public function it_should_forbid_anonymous_to_do_anything(
        Project $project,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.')
        ;

        $this->vote($token, $project, [ProjectVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_admin_to_do_everything(
        Project $project,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user->isAdmin()->willReturn(true);

        $this->vote($token, $project, [ProjectVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_project_admin_to_do_everything_on_his_project(
        Project $project,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user->isAdmin()->willReturn(false);
        $user->isProjectAdmin()->willReturn(true);
        $project->getOwner()->willReturn($user);

        $this->vote($token, $project, [ProjectVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_forbid_project_admin_to_do_everything_on_projects_he_does_not_own(
        Project $project,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user->isAdmin()->willReturn(false);
        $user->isProjectAdmin()->willReturn(true);
        $project->getOwner()->willReturn(null);

        $this->vote($token, $project, [ProjectVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_not_supports_attribute(
        User $user,
        Project $project,
        TokenInterface $token
    ): void {
        $this->vote($token, $user, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $project, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }

    public function it_should_allow_organization_member_to_create(
        User $user,
        ArrayCollection $memberShips,
        Project $project,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $user
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn($memberShips)
        ;
        $memberShips
            ->count()
            ->shouldBeCalled()
            ->willReturn(42)
        ;
        $this->vote($token, $project, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_members_to_edit_or_view_or_export_or_bo_or_duplicate_but_no_delete(
        User $user,
        Project $project,
        Organization $organization,
        OrganizationMember $memberShip,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $project
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip)
        ;
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER)
        ;
        $project
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null)
        ;
        $this->vote($token, $project, [ProjectVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::CREATE_PROPOSAL_FROM_BO])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::DUPLICATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_orga_admin_to_delete(
        User $user,
        Project $project,
        Organization $organization,
        OrganizationMember $memberShip,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $project
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip)
        ;
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::ADMIN)
        ;
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_creator_to_delete(
        User $user,
        Project $project,
        Organization $organization,
        OrganizationMember $memberShip,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $project
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip)
        ;
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER)
        ;
        $project
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $this->vote($token, $project, [ProjectVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_forbid_randoms_to_do_things(
        User $user,
        ArrayCollection $memberShips,
        Project $project,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $user
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn($memberShips)
        ;
        $memberShips
            ->count()
            ->shouldBeCalled()
            ->willReturn(0)
        ;
        $this->vote($token, $project, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $project, [ProjectVoter::CREATE_PROPOSAL_FROM_BO])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }
}
