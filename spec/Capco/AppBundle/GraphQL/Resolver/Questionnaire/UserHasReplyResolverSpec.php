<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\UserHasReplyResolver;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class UserHasReplyResolverSpec extends ObjectBehavior
{
    public function let(
        ReplyRepository $replyRepository,
        UserRepository $userRepository,
        LoggerInterface $logger
    ): void {
        $this->beConstructedWith($replyRepository, $userRepository, $logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserHasReplyResolver::class);
    }

    public function it_return_true_if_user_exists_and_user_has_reply(
        User $user,
        UserRepository $userRepository,
        ReplyRepository $replyRepository,
        Questionnaire $questionnaire,
        Collection $replies,
        Arg $args
    ): void {
        $args
            ->offsetGet('login')
            ->willReturn('pierre@cap-collectif.com')
        ;

        $userRepository
            ->findOneByEmail('pierre@cap-collectif.com')
            ->willReturn($user)
        ;

        $replyRepository
            ->getForUserAndQuestionnaire($questionnaire, $user, true)
            ->willReturn($replies)
        ;

        $replies
            ->isEmpty()
            ->willReturn(false)
        ;

        $this->__invoke($questionnaire, $args)->shouldReturn(true);
    }

    public function it_return_false_if_user_not_found(
        UserRepository $userRepo,
        Questionnaire $questionnaire,
        Arg $args
    ): void {
        $args->offsetGet('login')->willReturn('not-found@gmail.com');
        $userRepo->findOneByEmail('not-found@gmail.com')->willReturn(null);
        $this->__invoke($questionnaire, $args)->shouldReturn(false);
    }
}
