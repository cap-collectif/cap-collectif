<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class ProjectVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProjectVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        Project $project,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

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
            ->willReturn($user);

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
            ->willReturn($user);

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
            ->willReturn($user);

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

    public function it_does_not_supports_attribute(
        User $user,
        Project $project,
        TokenInterface $token
    ): void {
        $this->vote($token, $user, [ProjectVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $project, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
