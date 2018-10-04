<?php
namespace spec\Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\Resolver\Consultation\ConsultationUserHasVoteResolver;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class ConsultationUserHasVoteResolverSpec extends ObjectBehavior
{
    function let(
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

    function it_is_initializable()
    {
        $this->shouldHaveType(ConsultationUserHasVoteResolver::class);
    }

    function it_return_false_if_user_not_found(
        UserRepository $userRepo,
        ConsultationStep $step,
        Arg $args
    ) {
        $args->offsetGet('login')->willReturn('not-found@gmail.com');
        $userRepo->findOneByEmail('not-found@gmail.com')->willReturn(null);
        $this->__invoke($step, $args)->shouldReturn(false);
    }
}
