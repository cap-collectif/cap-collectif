<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Security\DebateOpinionVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class DebateOpinionVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(DebateOpinionVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        DebateOpinion $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $subject, [DebateOpinionVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [DebateOpinionVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [DebateOpinionVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_a_project_admin_to_create_a_debate_opinion(
        DebateOpinion $debateOpinion,
        TokenInterface $token,
        User $user
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);

        $user->isProjectAdmin()->willReturn(true);

        $this->vote($token, $debateOpinion, [DebateOpinionVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_a_project_admin_to_edit_and_delete_his_debate_opinion(
        DebateOpinion $debateOpinion,
        TokenInterface $token,
        User $user,
        Debate $debate,
        Project $project
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);

        $user->isAdmin()->willReturn(false);

        $debateOpinion->getDebate()->willReturn($debate);
        $debate->getProject()->willReturn($project);
        $project->getOwner()->willReturn($user);

        $this->vote($token, $debateOpinion, [DebateOpinionVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $debateOpinion, [DebateOpinionVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_an_author_to_edit_and_delete_his_debate_opinion(
        DebateOpinion $debateOpinion,
        TokenInterface $token,
        User $user,
        Debate $debate,
        Project $project
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);

        $user->isAdmin()->willReturn(false);

        $debateOpinion->getDebate()->willReturn($debate);
        $debate->getProject()->willReturn($project);
        $project->getOwner()->willReturn(null);

        $debateOpinion->getAuthor()->willReturn($user);

        $this->vote($token, $debateOpinion, [DebateOpinionVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $debateOpinion, [DebateOpinionVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(
        User $user,
        DebateOpinion $debateOpinion,
        TokenInterface $token
    ) {
        $this->vote($token, $user, [DebateOpinionVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $debateOpinion, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
