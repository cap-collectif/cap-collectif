<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Response\ResponseResolver;
use PhpSpec\ObjectBehavior;
use GraphQL\Type\Definition\Type;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Type\NodeTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Question\QuestionTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementTypeResolver;

class NodeTypeResolverSpec extends ObjectBehavior
{
    public function let(
        TypeResolver $typeResolver,
        RequirementTypeResolver $requirementTypeResolver,
        QuestionTypeResolver $questionTypeResolver,
        ResponseResolver $responseTypeResolver,
        ReplyTypeResolver $replyTypeResolver
    ) {
        $this->beConstructedWith(
            $typeResolver,
            $requirementTypeResolver,
            $questionTypeResolver,
            $responseTypeResolver,
            $replyTypeResolver
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(NodeTypeResolver::class);
    }

    public function it_should_resolve_debate(
        TypeResolver $typeResolver,
        Debate $debate,
        Type $type
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebate')
            ->shouldBeCalled()
            ->willReturn($type);
        $this->__invoke($debate)->shouldReturn($type);
    }

    public function it_should_resolve_debateStep(
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

    public function it_should_resolve_debateOpinion(
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

    public function it_should_resolve_debateArgument(
        TypeResolver $typeResolver,
        DebateArgument $debateArgument,
        Type $type
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateArgument')
            ->shouldBeCalled()
            ->willReturn($type);
        $this->__invoke($debateArgument)->shouldReturn($type);
    }

    public function it_should_resolve_debateArticle(
        TypeResolver $typeResolver,
        DebateArticle $article,
        Type $type
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateArticle')
            ->shouldBeCalled()
            ->willReturn($type);
        $this->__invoke($article)->shouldReturn($type);
    }

    public function it_should_resolve_response(
        TypeResolver $typeResolver,
        ResponseResolver $responseTypeResolver,
        ValueResponse $response,
        Type $type
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $responseTypeResolver
            ->__invoke($response)
            ->shouldBeCalled()
            ->willReturn($type);

        $this->__invoke($response)->shouldReturn($type);
    }
}
