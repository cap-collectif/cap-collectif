<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class EmailingCampaignVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(EmailingCampaignVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        EmailingCampaign $campaign,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $campaign, [
            EmailingCampaignVoter::CREATE,
            EmailingCampaignVoter::VIEW,
            EmailingCampaignVoter::EDIT,
            EmailingCampaignVoter::DELETE,
            EmailingCampaignVoter::SEND,
        ])->shouldBe(VoterInterface::ACCESS_DENIED);
    }

    public function it_forbid_basic_user_to_do_anything(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token
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
            ->willReturn(new ArrayCollection());

        $this->vote($token, $campaign, [
            EmailingCampaignVoter::CREATE,
            EmailingCampaignVoter::VIEW,
            EmailingCampaignVoter::EDIT,
            EmailingCampaignVoter::DELETE,
            EmailingCampaignVoter::SEND,
        ])->shouldBe(VoterInterface::ACCESS_DENIED);
    }

    public function it_allow_admin_to_do_anything(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, $campaign, [EmailingCampaignVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::SEND])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_project_admin_to_do_anything_if_owner(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token
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
        $campaign
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($user);

        $this->vote($token, $campaign, [EmailingCampaignVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::SEND])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_forbid_project_admin_to_do_anything_but_create_if_not_owner(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token
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
        $campaign
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->vote($token, $campaign, [EmailingCampaignVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::SEND])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_organisation_member_to_create_view_edit_send(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token,
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
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $campaign
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $campaign
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->vote($token, $campaign, [EmailingCampaignVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::SEND])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $campaign, [EmailingCampaignVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_organisation_creator_to_also_delete(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token,
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
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $campaign
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $campaign
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($user);

        $this->vote($token, $campaign, [EmailingCampaignVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_organisation_admin_to_also_delete(
        EmailingCampaign $campaign,
        User $user,
        TokenInterface $token,
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
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::ADMIN);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $campaign
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);

        $this->vote($token, $campaign, [EmailingCampaignVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }
}
