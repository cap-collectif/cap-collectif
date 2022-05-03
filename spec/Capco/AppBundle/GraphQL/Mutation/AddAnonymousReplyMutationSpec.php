<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\GraphQL\Mutation\AddAnonymousReplyMutation;
use Capco\AppBundle\Helper\ResponsesFormatter;
use FOS\UserBundle\Util\TokenGenerator;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\Utils\RequestGuesser;
use Symfony\Component\Form\FormFactoryInterface;

class AddAnonymousReplyMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        LoggerInterface $logger,
        RequestGuesser $requestGuesser,
        TokenGeneratorInterface $tokenGenerator,
        GlobalIdResolver $globalIdResolver,
        Publisher $publisher,
        Indexer $indexer
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $responsesFormatter,
            $logger,
            $requestGuesser,
            $tokenGenerator,
            $globalIdResolver,
            $publisher,
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddAnonymousReplyMutation::class);
    }

    public function it_should_correctly_add_an_anonymous_reply(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        RequestGuesser $requestGuesser,
        TokenGenerator $tokenGenerator,
        ResponsesFormatter $responsesFormatter,
        FormFactoryInterface $formFactory,
        Form $form,
        EntityManagerInterface $em,
        Indexer $indexer
    ) {
        $values = [
            'questionnaireId' => 'abc',
            'responses' => [
                0 => [
                    'value' => 'koko',
                    'question' => 1403,
                ],
            ],
            'participantEmail' => null,
        ];

        $userAgent = 'ABC';
        $ip = '1.1.1.1.1.1';
        $token = 'token';
        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalledOnce()
            ->willReturn($userAgent);
        $requestGuesser
            ->getClientIp()
            ->shouldBeCalledOnce()
            ->willReturn($ip);
        $tokenGenerator
            ->generateToken()
            ->shouldBeCalledOnce()
            ->willReturn($token);

        $input
            ->getArrayCopy()
            ->shouldBeCalledOnce()
            ->willReturn($values);
        $globalIdResolver
            ->resolve('abc', null)
            ->shouldBeCalledOnce()
            ->willReturn($questionnaire);

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
            'participantEmail' => null,
        ];

        $formFactory
            ->create(ReplyAnonymousType::class, Argument::type(ReplyAnonymous::class))
            ->shouldBeCalledOnce()
            ->willReturn($form);
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(ReplyAnonymous::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();
        $indexer->index(ReplyAnonymous::class, Argument::any())->shouldBeCalledOnce();
        $indexer->finishBulk()->shouldBeCalledOnce();

        $questionnaire->isNotifyResponseCreate()->willReturn(false);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['questionnaire']->shouldBe($questionnaire);
        $payload['questionnaire']->shouldHaveType(Questionnaire::class);
        $payload['reply']->shouldHaveType(ReplyAnonymous::class);
        $payload['token']->shouldBe($token);
    }

    public function it_should_notify_admin(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        RequestGuesser $requestGuesser,
        TokenGenerator $tokenGenerator,
        ResponsesFormatter $responsesFormatter,
        FormFactoryInterface $formFactory,
        Form $form,
        EntityManagerInterface $em,
        Publisher $publisher,
        Indexer $indexer
    ) {
        $values = [
            'questionnaireId' => 'abc',
            'responses' => [
                0 => [
                    'value' => 'koko',
                    'question' => 1403,
                ],
            ],
            'participantEmail' => null,
        ];

        $userAgent = 'ABC';
        $ip = '1.1.1.1.1.1';
        $token = 'token';
        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalledOnce()
            ->willReturn($userAgent);
        $requestGuesser
            ->getClientIp()
            ->shouldBeCalledOnce()
            ->willReturn($ip);
        $tokenGenerator
            ->generateToken()
            ->shouldBeCalledOnce()
            ->willReturn($token);

        $input
            ->getArrayCopy()
            ->shouldBeCalledOnce()
            ->willReturn($values);
        $globalIdResolver
            ->resolve('abc', null)
            ->shouldBeCalledOnce()
            ->willReturn($questionnaire);

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
            'participantEmail' => null,
        ];

        $formFactory
            ->create(ReplyAnonymousType::class, Argument::type(ReplyAnonymous::class))
            ->shouldBeCalledOnce()
            ->willReturn($form);
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(ReplyAnonymous::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();
        $indexer->index(ReplyAnonymous::class, Argument::any())->shouldBeCalledOnce();
        $indexer->finishBulk()->shouldBeCalledOnce();

        $questionnaire
            ->isNotifyResponseCreate()
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $questionnaire
            ->isNotifyResponseCreate()
            ->shouldBeCalledOnce()
            ->willReturn(true);
        $publisher
            ->publish('questionnaire.reply', Argument::type(Message::class))
            ->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['questionnaire']->shouldBe($questionnaire);
        $payload['questionnaire']->shouldHaveType(Questionnaire::class);
        $payload['reply']->shouldHaveType(ReplyAnonymous::class);
        $payload['token']->shouldBe($token);
    }
}
