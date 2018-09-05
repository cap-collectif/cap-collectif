<?php
namespace spec\Capco\AppBundle\GraphQL\Resolver\Consultation;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\UserBundle\Repository\UserRepository;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Resolver\Consultation\ConsultationUserHasVoteResolver;

class ConsultationUserHasVoteResolverSpec extends ObjectBehavior
{
    function let(
        UserRepository $userRepo,
        OpinionVoteRepository $opinionVoteRepo,
        ArgumentVoteRepository $argumentVoteRepo,
        SourceVoteRepository $sourceVoteRepo,
        OpinionVersionVoteRepository $versionVoteRepo
    ) {
        $this->beConstructedWith(
            $userRepo,
            $opinionVoteRepo,
            $argumentVoteRepo,
            $sourceVoteRepo,
            $versionVoteRepo
        );
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(ConsultationUserHasVoteResolver::class);
    }

    function it_throws_an_error_if_user_not_found(
        UserRepository $userRepo,
        ConsultationStep $step,
        Arg $args
    ) {
        $args->offsetGet('login')->willReturn('not-found@gmail.com');
        $userRepo->findOneByEmail('not-found@gmail.com')->willReturn(null);
        $this->shouldThrow(new UserError('Could not find user.'))->during('__invoke', [
            $step,
            $args,
        ]);
    }
}
