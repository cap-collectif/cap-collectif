<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Mutation\AddUserReplyMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class AddUserReplyMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        GlobalIdResolver $globalIdResolver,
        ResponsesFormatter $responsesFormatter,
        LoggerInterface $logger,
        Publisher $publisher,
        RequestGuesser $requestGuesser,
        StepRequirementsResolver $stepRequirementsResolver,
        Indexer $indexer
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $replyRepo,
            $globalIdResolver,
            $responsesFormatter,
            $logger,
            $publisher,
            $requestGuesser,
            $stepRequirementsResolver,
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddUserReplyMutation::class);
    }

    public function it_should_correctly_add_a_reply(
        Arg $input,
        Questionnaire $questionnaire,
        Publisher $publisher,
        User $user,
        GlobalIdResolver $globalIdResolver,
        QuestionnaireStep $step,
        StepRequirementsResolver $stepRequirementsResolver,
        ResponsesFormatter $responsesFormatter,
        FormFactoryInterface $formFactory,
        FormInterface $form,
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
        ];

        $input
            ->getArrayCopy()
            ->shouldBeCalledOnce()
            ->willReturn($values)
        ;

        $globalIdResolver
            ->resolve('abc', $user)
            ->shouldBeCalledOnce()
            ->willReturn($questionnaire)
        ;

        $questionnaire->canContribute($user)->shouldBeCalledOnce()->willReturn(true);
        $questionnaire->isMultipleRepliesAllowed()->shouldBeCalledOnce()->willReturn(false);

        $questionnaire->getStep()->shouldBeCalledOnce()->willReturn($step);
        $stepRequirementsResolver->viewerMeetsTheRequirementsResolver($user, $step)->willReturn(true);

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
            ->willReturn($formattedResponses)
        ;

        $values = [
            'responses' => $formattedResponses,
        ];

        $questionnaire->isAnonymousAllowed()->shouldBeCalledOnce()->willReturn(false);

        $formFactory
            ->create(ReplyType::class, Argument::type(Reply::class), Argument::any())
            ->shouldBeCalledOnce()
            ->willReturn($form)
        ;
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(Reply::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();
        $indexer->index(Reply::class, Argument::any())->shouldBeCalledOnce();
        $indexer->finishBulk()->shouldBeCalledOnce();

        $publisher->publish('questionnaire.reply', Argument::type(Message::class))->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $user);
        $payload->shouldHaveCount(3);
        $payload['questionnaire']->shouldBe($questionnaire);
        $payload['questionnaire']->shouldHaveType(Questionnaire::class);
        $payload['reply']->shouldHaveType(Reply::class);
    }
}
