<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\GraphQL\Mutation\Sms\CreateSmsOrderMutation;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class CreateSmsOrderMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        SmsNotifier $notifier,
        SmsOrderRepository $smsOrderRepository
    ) {
        $this->beConstructedWith($em, $notifier, $smsOrderRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CreateSmsOrderMutation::class);
    }

    public function it_should_create_sms_order_and_call_on_create_sms_order(
        Arg $input,
        EntityManagerInterface $em,
        SmsOrderRepository $smsOrderRepository,
        SmsNotifier $notifier
    ) {
        $amount = '1000';
        $input
            ->offsetGet('amount')
            ->shouldBeCalledOnce()
            ->willReturn($amount);

        $smsOrder = new SmsOrder();
        $smsOrder->setAmount($amount);

        $em->persist($smsOrder)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $smsOrderRepository
            ->countAll()
            ->shouldBeCalledOnce()
            ->willReturn(0);
        $notifier->onCreateSmsOrder($smsOrder)->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(1);
        $payload['smsOrder']->shouldHaveType(SmsOrder::class);
    }

    public function it_should_create_sms_order_and_call_on_refill_sms_order(
        Arg $input,
        EntityManagerInterface $em,
        SmsOrderRepository $smsOrderRepository,
        SmsNotifier $notifier
    ) {
        $amount = '1000';
        $input
            ->offsetGet('amount')
            ->shouldBeCalledOnce()
            ->willReturn($amount);

        $smsOrder = new SmsOrder();
        $smsOrder->setAmount($amount);

        $em->persist($smsOrder)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $smsOrderRepository
            ->countAll()
            ->shouldBeCalledOnce()
            ->willReturn(1);
        $notifier->onRefillSmsOrder($smsOrder)->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(1);
        $payload['smsOrder']->shouldHaveType(SmsOrder::class);
    }
}
