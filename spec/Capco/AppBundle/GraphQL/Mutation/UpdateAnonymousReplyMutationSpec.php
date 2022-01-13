<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\GraphQL\Mutation\UpdateAnonymousReplyMutation;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use GraphQL\Error\UserError;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateAnonymousReplyMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Publisher $publisher
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $responsesFormatter,
            $replyAnonymousRepository,
            $publisher
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateAnonymousReplyMutation::class);
    }

    public function it_should_correctly_update_an_anonymous_reply(
        Arg $input,
        ResponsesFormatter $responsesFormatter,
        FormFactoryInterface $formFactory,
        Form $form,
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        ReplyAnonymous $reply
    ) {
        $hashedToken = 'abc';
        $values = [
            'responses' => [
                0 => [
                    'value' => 'koko',
                    'question' => 1403,
                ],
            ],
            'hashedToken' => $hashedToken,
        ];

        $input
            ->offsetGet('hashedToken')
            ->shouldBeCalledOnce()
            ->willReturn($hashedToken);
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository
            ->findOneBy(['token' => $decodedToken])
            ->shouldBeCalledOnce()
            ->willReturn($reply);

        $input
            ->getArrayCopy()
            ->shouldBeCalledOnce()
            ->willReturn($values);

        $formattedResponses = [
            0 => [
                'value' => 'koko',
                'question' => 1403,
                'position' => 1,
                '_type' => 'value_response',
            ],
        ];
        $responsesFormatter
            ->format($values['responses'])
            ->shouldBeCalledOnce()
            ->willReturn($formattedResponses);

        $values = [
            'responses' => $formattedResponses,
        ];

        $formFactory
            ->create(ReplyAnonymousType::class, Argument::type(ReplyAnonymous::class))
            ->shouldBeCalledOnce()
            ->willReturn($form);
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->willReturn(true);

        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(1);
        $payload['reply']->shouldBe($reply);
        $payload['reply']->shouldHaveType(ReplyAnonymous::class);
    }

    public function it_should_notify_admin(
        Arg $input,
        ResponsesFormatter $responsesFormatter,
        FormFactoryInterface $formFactory,
        Form $form,
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        ReplyAnonymous $reply,
        Questionnaire $questionnaire,
        Publisher $publisher
    ) {
        $hashedToken = 'abc';
        $values = [
            'responses' => [
                0 => [
                    'value' => 'koko',
                    'question' => 1403,
                ],
            ],
            'hashedToken' => $hashedToken,
        ];

        $input
            ->offsetGet('hashedToken')
            ->shouldBeCalledOnce()
            ->willReturn($hashedToken);
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository
            ->findOneBy(['token' => $decodedToken])
            ->shouldBeCalledOnce()
            ->willReturn($reply);

        $input
            ->getArrayCopy()
            ->shouldBeCalledOnce()
            ->willReturn($values);

        $formattedResponses = [
            0 => [
                'value' => 'koko',
                'question' => 1403,
                'position' => 1,
                '_type' => 'value_response',
            ],
        ];
        $responsesFormatter
            ->format($values['responses'])
            ->shouldBeCalledOnce()
            ->willReturn($formattedResponses);

        $values = [
            'responses' => $formattedResponses,
        ];

        $formFactory
            ->create(ReplyAnonymousType::class, Argument::type(ReplyAnonymous::class))
            ->shouldBeCalledOnce()
            ->willReturn($form);
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->willReturn(true);

        $em->flush()->shouldBeCalledOnce();

        $reply
            ->getQuestionnaire()
            ->shouldBeCalledOnce()
            ->willReturn($questionnaire);
        $questionnaire->isNotifyResponseUpdate()->willReturn(true);
        $reply->getId()->shouldBeCalledOnce();
        $publisher->publish('questionnaire.reply', Argument::type(Message::class));

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(1);
        $payload['reply']->shouldBe($reply);
        $payload['reply']->shouldHaveType(ReplyAnonymous::class);
    }

    public function it_should_throw_error_if_no_reply_found(
        Arg $input,
        ReplyAnonymousRepository $replyAnonymousRepository
    ) {
        $hashedToken = 'abc';

        $input
            ->offsetGet('hashedToken')
            ->shouldBeCalledOnce()
            ->willReturn($hashedToken);
        $decodedToken = base64_decode($hashedToken);
        $replyAnonymousRepository
            ->findOneBy(['token' => $decodedToken])
            ->shouldBeCalledOnce()
            ->willReturn(null);

        $this->shouldThrow(new UserError('Reply not found.'))->during('__invoke', [$input]);
    }
}
