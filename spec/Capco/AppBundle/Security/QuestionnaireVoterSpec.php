<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
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
            ->willReturn('anon.');

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
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);

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
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);

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
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

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
