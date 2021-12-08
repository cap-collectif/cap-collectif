<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\GraphQL\Mutation\DeleteAnonymousReplyMutation;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\Elasticsearch\Indexer;


class DeleteAnonymousReplyMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Indexer $indexer
    ) {

        $this->beConstructedWith(
            $em,
            $replyAnonymousRepository,
            $indexer
        );
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
    )
    {
        $hashedToken = 'token';

        $input->offsetGet('hashedToken')->shouldBeCalledOnce()->willReturn($hashedToken);
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository->findOneBy(['token' => $decodedToken])->shouldBeCalledOnce()->willReturn($reply);
        $reply->getId()->shouldBeCalled()->willReturn('replyId');
        $reply->getQuestionnaire()->shouldBeCalledOnce()->willReturn($questionnaire);

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
    )
    {
        $hashedToken = 'abc';

        $input->offsetGet('hashedToken')->shouldBeCalledOnce()->willReturn($hashedToken);
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository->findOneBy(['token' => $decodedToken])->shouldBeCalledOnce()->willReturn(null);

        $this->shouldThrow(
            new UserError('Reply not found')
        )->during('__invoke', [$input]);
    }
}
