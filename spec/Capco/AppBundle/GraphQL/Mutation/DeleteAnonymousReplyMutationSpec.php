<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Mutation\DeleteAnonymousReplyMutation;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteAnonymousReplyMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Indexer $indexer,
        Publisher $publisher
    ) {
        $this->beConstructedWith($em, $replyAnonymousRepository, $indexer, $publisher);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteAnonymousReplyMutation::class);
    }

    public function it_should_correctly_delete_an_anonymous_reply(
        Arg $input,
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        ReplyAnonymous $reply,
        Questionnaire $questionnaire
    ) {
        $hashedToken = 'token';

        $input
            ->offsetGet('hashedToken')
            ->shouldBeCalledOnce()
            ->willReturn($hashedToken)
        ;
        $this->getMockedGraphQLArgumentFormatted($input);
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository
            ->findOneBy(['token' => $decodedToken])
            ->shouldBeCalledOnce()
            ->willReturn($reply)
        ;
        $reply
            ->getId()
            ->shouldBeCalled()
            ->willReturn('replyId')
        ;
        $reply
            ->getQuestionnaire()
            ->shouldBeCalledOnce()
            ->willReturn($questionnaire)
        ;

        $questionnaire
            ->isNotifyResponseDelete()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;

        $replyId = GlobalId::toGlobalId('Reply', 'replyId');

        $em->remove($reply)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['replyId']->shouldBe($replyId);
        $payload['questionnaire']->shouldBe($questionnaire);
        $payload['questionnaire']->shouldHaveType(Questionnaire::class);
    }

    public function it_should_correctly_notify_admin(
        Arg $input,
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        ReplyAnonymous $reply,
        Questionnaire $questionnaire,
        Publisher $publisher,
        QuestionnaireStep $step,
        Project $project
    ) {
        $hashedToken = 'token';

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('hashedToken')
            ->shouldBeCalledOnce()
            ->willReturn($hashedToken)
        ;
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository
            ->findOneBy(['token' => $decodedToken])
            ->shouldBeCalledOnce()
            ->willReturn($reply)
        ;
        $reply
            ->getId()
            ->shouldBeCalled()
            ->willReturn('replyId')
        ;
        $reply
            ->getQuestionnaire()
            ->shouldBeCalledOnce()
            ->willReturn($questionnaire)
        ;

        $questionnaire
            ->isNotifyResponseDelete()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $questionnaire->getId()->shouldBeCalledOnce();
        $reply
            ->getStep()
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;
        $step
            ->getProject()
            ->shouldBeCalledOnce()
            ->willReturn($project)
        ;
        $step->getTitle()->shouldBeCalledOnce();
        $project->getTitle()->shouldBeCalledOnce();
        $publisher->publish('questionnaire.reply', Argument::type(Message::class));

        $replyId = GlobalId::toGlobalId('Reply', 'replyId');

        $em->remove($reply)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['replyId']->shouldBe($replyId);
        $payload['questionnaire']->shouldBe($questionnaire);
        $payload['questionnaire']->shouldHaveType(Questionnaire::class);
    }

    public function it_should_throw_error_if_no_reply_found(
        Arg $input,
        ReplyAnonymousRepository $replyAnonymousRepository
    ) {
        $hashedToken = 'abc';

        $input
            ->offsetGet('hashedToken')
            ->shouldBeCalledOnce()
            ->willReturn($hashedToken)
        ;

        $this->getMockedGraphQLArgumentFormatted($input);

        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository
            ->findOneBy(['token' => $decodedToken])
            ->shouldBeCalledOnce()
            ->willReturn(null)
        ;

        $this->shouldThrow(new UserError('Reply not found'))->during('__invoke', [$input]);
    }
}
