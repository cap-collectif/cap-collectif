<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class QuestionnaireVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(QuestionnaireVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        Questionnaire $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.')
        ;

        $this->vote($token, $subject, [QuestionnaireVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_forbid_project_admin_to_do_anything_with_someone_else_project(
        Questionnaire $subject,
        TokenInterface $token,
        User $user
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

        $subject->getOwner()->willReturn(null);

        $this->vote($token, $subject, [QuestionnaireVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_project_admin_to_do_anything_with_his_project(
        Questionnaire $subject,
        TokenInterface $token,
        User $user
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

        $subject->getOwner()->willReturn($user);

        $this->vote($token, $subject, [QuestionnaireVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_admin_to_do_anything(
        Questionnaire $subject,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true)
        ;

        $this->vote($token, $subject, [QuestionnaireVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [QuestionnaireVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_members_to_create_view_edit_export(
        User $user,
        Questionnaire $questionnaire,
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
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $user
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn(new ArrayCollection([$organization]))
        ;
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER)
        ;
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip)
        ;
        $questionnaire
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;
        $questionnaire
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null)
        ;

        $this->vote($token, $questionnaire, [QuestionnaireVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $questionnaire, [QuestionnaireVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $questionnaire, [QuestionnaireVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $questionnaire, [QuestionnaireVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $questionnaire, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_creator_member_to_delete(
        User $user,
        Questionnaire $questionnaire,
        Organization $organization,
        OrganizationMember $memberShip,
        TokenInterface $token
    ) {
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
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER)
        ;
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip)
        ;
        $questionnaire
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;
        $questionnaire
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $this->vote($token, $questionnaire, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_organization_admin_to_delete(
        User $user,
        Questionnaire $questionnaire,
        Organization $organization,
        OrganizationMember $memberShip,
        TokenInterface $token
    ) {
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
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::ADMIN)
        ;
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip)
        ;
        $questionnaire
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;

        $this->vote($token, $questionnaire, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(
        User $user,
        Questionnaire $questionnaire,
        TokenInterface $token
    ) {
        $this->vote($token, $user, [QuestionnaireVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $questionnaire, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
