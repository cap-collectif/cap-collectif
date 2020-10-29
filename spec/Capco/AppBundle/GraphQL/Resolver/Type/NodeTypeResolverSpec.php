<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Type;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Debate\Debate;
use GraphQL\Type\Definition\Type;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Type\NodeTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Question\QuestionTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementTypeResolver;

class NodeTypeResolverSpec extends ObjectBehavior
{
    public function let(
        TypeResolver $typeResolver,
        RequirementTypeResolver $requirementTypeResolver,
        QuestionTypeResolver $questionTypeResolver
    ) {
        $this->beConstructedWith($typeResolver, $requirementTypeResolver, $questionTypeResolver);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(NodeTypeResolver::class);
    }

    public function it_resolve_debate(TypeResolver $typeResolver, Debate $debate, Type $type): void
    {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebate')
            ->shouldBeCalled()
            ->willReturn($type);
        $this->__invoke($debate)->shouldReturn($type);
    }

    public function it_resolve_debateStep(
        TypeResolver $typeResolver,
        DebateStep $debateStep,
        Type $type
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateStep')
            ->shouldBeCalled()
            ->willReturn($type);
        $this->__invoke($debateStep)->shouldReturn($type);
    }

    public function it_resolve_debateOpinion(
        TypeResolver $typeResolver,
        DebateOpinion $debateOpinion,
        Type $type
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateOpinion')
            ->shouldBeCalled()
            ->willReturn($type);
        $this->__invoke($debateOpinion)->shouldReturn($type);
    }
}
