<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\UserHasReplyResolver;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Repository\UserRepository;
use FOS\UserBundle\Model\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class UserHasReplySpec extends ObjectBehavior
{
    public function let(
        ReplyRepository $replyRepository,
        UserRepository $userRepo,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($replyRepository, $userRepo, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UserHasReplyResolver::class);
    }

    public function it_return_true_if_user_exists_and_user_has_reply(
        User $user,
        UserRepository $userRepo,
        ReplyRepository $replyRepository,
        Questionnaire $questionnaire,
        Arg $args
    ) {
        $args->offsetGet('login')->willReturn('pierre@cap-collectif.com');
        $userRepo->findOneByEmail('pierre@cap-collectif.com')->willReturn($user);
        $replyRepository
            ->getForUserAndQuestionnaire($questionnaire, $user)
            ->isEmpty()
            ->willReturn(false)
        ;
        $this->__invoke($questionnaire, $args)->shouldReturn(true);
    }

    public function it_return_false_if_user_not_found(
        UserRepository $userRepo,
        Questionnaire $questionnaire,
        Arg $args
    ) {
        $args->offsetGet('login')->willReturn('not-found@gmail.com');
        $userRepo->findOneByEmail('not-found@gmail.com')->willReturn(null);
        $this->__invoke($questionnaire, $args)->shouldReturn(false);
    }
}
