<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\GraphQL\Mutation\Debate\DeleteDebateOpinionMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteDebateOpinionMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->beConstructedWith($em, $logger, $globalIdResolver, $authorizationChecker);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteDebateOpinionMutation::class);
    }

    public function it_delete_an_opinion(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateOpinion $debateOpinion,
        Debate $debate
    ) {
        $id = '123';
        $input->offsetGet('debateOpinionId')->willReturn($id);
        $globalIdResolver->resolve($id, null)->willReturn($debateOpinion);

        $debateOpinion->getDebate()->willReturn($debate);

        $em->remove($debateOpinion)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['debate']->shouldBe($debate);
        $payload['deletedDebateOpinionId']->shouldBe($id);
    }

    public function it_errors_on_invalid_id(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate
    ) {
        $id = '123';
        $input->offsetGet('debateOpinionId')->willReturn($id);
        $globalIdResolver->resolve($id, null)->willReturn(null);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE_OPINION');
        $payload['debate']->shouldBe(null);
        $payload['deletedDebateOpinionId']->shouldBe(null);
    }
}
