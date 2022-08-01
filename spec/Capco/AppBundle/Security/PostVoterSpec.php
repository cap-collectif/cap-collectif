<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class PostVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(PostVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(Post $subject, TokenInterface $token): void
    {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $subject, [PostVoter::CREATE])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [PostVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [PostVoter::DELETE])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [PostVoter::VIEW])->shouldBe(VoterInterface::ACCESS_DENIED);
    }

    public function it_forbid_project_admin_to_do_anything_with_someone_else_project(
        Post $subject,
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
        $subject->getProjects()->willReturn(new ArrayCollection());
        $subject->getAuthors()->willReturn(new ArrayCollection());

        $this->vote($token, $subject, [PostVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [PostVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [PostVoter::DELETE])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [PostVoter::VIEW])->shouldBe(VoterInterface::ACCESS_DENIED);
    }

    public function it_allow_project_admin_to_do_anything_with_is_project(
        Post $subject,
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

        $this->vote($token, $subject, [PostVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [PostVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [PostVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [PostVoter::VIEW])->shouldBe(VoterInterface::ACCESS_GRANTED);
    }

    public function it_allow_admin_to_do_anything(
        Post $subject,
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

        $this->vote($token, $subject, [PostVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [PostVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [PostVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [PostVoter::VIEW])->shouldBe(VoterInterface::ACCESS_GRANTED);
    }

    public function it_allow_member_of_organization_to_create_read_update_with_the_post(
        TokenInterface $token,
        User $user,
        Post $subject,
        Organization $organization,
        OrganizationMember $memberShip
    ) {
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

        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $subject
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);

        $subject->getAuthors()->willReturn(new ArrayCollection());
        $subject->getProjects()->willReturn(new ArrayCollection());

        // CREATION is handled in CreatePostMutationSpec
        $this->vote($token, $subject, [PostVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [PostVoter::DELETE])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [PostVoter::VIEW])->shouldBe(VoterInterface::ACCESS_GRANTED);
    }

    public function it_allow_member_of_organization_post_author_to_delete_the_post(
        TokenInterface $token,
        User $user,
        Post $subject,
        Organization $organization,
        OrganizationMember $memberShip
    ) {
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

        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);

        $this->vote($token, $subject, [PostVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(User $user, Post $post, TokenInterface $token)
    {
        $this->vote($token, $user, [PostVoter::CREATE])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
        $this->vote($token, $post, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
