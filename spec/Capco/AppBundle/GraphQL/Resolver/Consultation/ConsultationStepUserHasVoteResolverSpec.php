<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\Resolver\Consultation\ConsultationStepUserHasVoteResolver;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class ConsultationStepUserHasVoteResolverSpec extends ObjectBehavior
{
    public function let(
        UserRepository $userRepo,
        OpinionVoteRepository $opinionVoteRepo,
        ArgumentVoteRepository $argumentVoteRepo,
        SourceVoteRepository $sourceVoteRepo,
        OpinionVersionVoteRepository $versionVoteRepo,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith(
            $userRepo,
            $opinionVoteRepo,
            $argumentVoteRepo,
            $sourceVoteRepo,
            $versionVoteRepo,
            $logger
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ConsultationStepUserHasVoteResolver::class);
    }

    public function it_return_false_if_user_not_found(
        UserRepository $userRepo,
        ConsultationStep $step,
        Arg $args
    ) {
        $args->offsetGet('login')->willReturn('not-found@gmail.com');
        $userRepo->findOneByEmail('not-found@gmail.com')->willReturn(null);
        $this->__invoke($step, $args)->shouldReturn(false);
    }
}
