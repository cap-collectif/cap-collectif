<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\GraphQL\Resolver\ContributorTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\District\DistrictTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Question\QuestionTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Response\ResponseResolver;
use Capco\AppBundle\GraphQL\Resolver\Type\NodeTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\RequestStack;

class NodeTypeResolverSpec extends ObjectBehavior
{
    public function let(
        TypeResolver $typeResolver,
        RequirementTypeResolver $requirementTypeResolver,
        QuestionTypeResolver $questionTypeResolver,
        ResponseResolver $responseTypeResolver,
        ReplyTypeResolver $replyTypeResolver,
        DistrictTypeResolver $districtTypeResolver,
        ContributorTypeResolver $contributorTypeResolver,
        ActionLogger $actionLogger
    ) {
        $actionLogger->logGraphQLMutation(Argument::any(), Argument::any(), Argument::any(), Argument::any(), Argument::any())->willReturn(true);

        $this->beConstructedWith(
            $typeResolver,
            $requirementTypeResolver,
            $questionTypeResolver,
            $responseTypeResolver,
            $replyTypeResolver,
            $districtTypeResolver,
            $contributorTypeResolver,
            $actionLogger
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(NodeTypeResolver::class);
    }

    public function it_should_resolve_debate(
        TypeResolver $typeResolver,
        Debate $debate,
        Type $type,
        User $viewer
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebate')
            ->shouldBeCalled()
            ->willReturn($type)
        ;
        $this->__invoke($debate, new RequestStack(), $viewer)->shouldReturn($type);
    }

    public function it_should_resolve_debateStep(
        TypeResolver $typeResolver,
        DebateStep $debateStep,
        Type $type,
        User $viewer
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateStep')
            ->shouldBeCalled()
            ->willReturn($type)
        ;
        $this->__invoke($debateStep, new RequestStack(), $viewer)->shouldReturn($type);
    }

    public function it_should_resolve_debateOpinion(
        TypeResolver $typeResolver,
        DebateOpinion $debateOpinion,
        Type $type,
        User $viewer
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateOpinion')
            ->shouldBeCalled()
            ->willReturn($type)
        ;
        $this->__invoke($debateOpinion, new RequestStack(), $viewer)->shouldReturn($type);
    }

    public function it_should_resolve_debateArgument(
        TypeResolver $typeResolver,
        DebateArgument $debateArgument,
        Type $type,
        User $viewer
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateArgument')
            ->shouldBeCalled()
            ->willReturn($type)
        ;
        $this->__invoke($debateArgument, new RequestStack(), $viewer)->shouldReturn($type);
    }

    public function it_should_resolve_debateArticle(
        TypeResolver $typeResolver,
        DebateArticle $article,
        Type $type,
        User $viewer
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $typeResolver
            ->resolve('InternalDebateArticle')
            ->shouldBeCalled()
            ->willReturn($type)
        ;
        $this->__invoke($article, new RequestStack(), $viewer)->shouldReturn($type);
    }

    public function it_should_resolve_response(
        TypeResolver $typeResolver,
        ResponseResolver $responseTypeResolver,
        ValueResponse $response,
        Type $type,
        User $viewer
    ): void {
        $typeResolver->getCurrentSchemaName()->willReturn('internal');
        $responseTypeResolver
            ->__invoke($response)
            ->shouldBeCalled()
            ->willReturn($type)
        ;

        $this->__invoke($response, new RequestStack(), $viewer)->shouldReturn($type);
    }
}
