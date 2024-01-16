<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\GraphQL\Mutation\Sms\CreateSmsOrderMutation;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class CreateSmsOrderMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        SmsOrderRepository $smsOrderRepository,
        Publisher $publisher
    ) {
        $this->beConstructedWith($em, $smsOrderRepository, $publisher);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CreateSmsOrderMutation::class);
    }

    public function it_should_create_sms_order_and_call_on_create_sms_order(
        Arg $input,
        EntityManagerInterface $em,
        SmsOrderRepository $smsOrderRepository,
        Publisher $publisher
    ) {
        $amount = '1000';
        $this->getMockedGraphQLArgumentFormatted($input);
        $input
            ->offsetGet('amount')
            ->shouldBeCalledOnce()
            ->willReturn($amount)
        ;

        $smsOrder = new SmsOrder();
        $smsOrder->setAmount($amount);

        $em->persist($smsOrder)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $smsOrderRepository
            ->countAll()
            ->shouldBeCalledOnce()
            ->willReturn(0)
        ;

        $publisher->publish(
            'sms_credit.initial_order',
            Argument::type(Message::class)
        )->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(1);
        $payload['smsOrder']->shouldHaveType(SmsOrder::class);
    }

    public function it_should_create_sms_order_and_call_on_refill_sms_order(
        Arg $input,
        EntityManagerInterface $em,
        SmsOrderRepository $smsOrderRepository,
        Publisher $publisher
    ) {
        $amount = '1000';
        $this->getMockedGraphQLArgumentFormatted($input);
        $input
            ->offsetGet('amount')
            ->shouldBeCalledOnce()
            ->willReturn($amount)
        ;

        $smsOrder = new SmsOrder();
        $smsOrder->setAmount($amount);

        $em->persist($smsOrder)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $smsOrderRepository
            ->countAll()
            ->shouldBeCalledOnce()
            ->willReturn(1)
        ;

        $publisher->publish(
            'sms_credit.refill_order',
            Argument::type(Message::class)
        )->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(1);
        $payload['smsOrder']->shouldHaveType(SmsOrder::class);
    }
}
