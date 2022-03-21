<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Form\SmsCreditType;
use Capco\AppBundle\GraphQL\Mutation\Sms\AddSmsCreditMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class AddSmsCreditMutationSpec extends ObjectBehavior
{

    public function let(
        EntityManagerInterface $em,
        SmsNotifier            $notifier,
        SmsCreditRepository    $smsCreditRepository,
        GlobalIdResolver       $globalIdResolver,
        FormFactoryInterface   $formFactory
    )
    {
        $this->beConstructedWith(
            $em,
            $notifier,
            $smsCreditRepository,
            $globalIdResolver,
            $formFactory

        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddSmsCreditMutation::class);
    }

    public function it_should_create_sms_credit_and_call_on_initial_sms_credit(
        Arg                    $input,
        EntityManagerInterface $em,
        SmsCreditRepository    $smsCreditRepository,
        SmsNotifier            $notifier,
        User                   $viewer,
        GlobalIdResolver       $globalIdResolver,
        SmsOrder               $smsOrder,
        FormFactoryInterface   $formFactory,
        FormInterface          $form
    )
    {
        $smsOrderId = 'smsOrderId';
        $input->offsetGet('smsOrder')->shouldBeCalledOnce()->willReturn($smsOrderId);
        $globalIdResolver->resolve($smsOrderId, $viewer)->shouldBeCalledOnce()->willReturn($smsOrder);

        $values = [
            'amount' => 1000,
            'smsOrder' => $smsOrderId
        ];
        $input->getArrayCopy()->shouldBeCalledOnce()->willReturn($values);

        $smsCredit = new SmsCredit();
        $formFactory->create(SmsCreditType::class, Argument::type(SmsCredit::class))->willReturn($form)->shouldBeCalledOnce();
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->shouldBeCalledOnce()->willReturn(true);

        $smsOrder->setIsProcessed(true)->shouldBeCalledOnce();
        $em->persist($smsOrder)->shouldBeCalledOnce();
        $em->persist($smsCredit)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $smsCreditRepository->countAll()->shouldBeCalledOnce()->willReturn(0);
        $notifier->onInitialSmsCredit($smsCredit)->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['smsCredit']->shouldHaveType(SmsCredit::class);
    }

    public function it_should_create_sms_credit_and_call_on_refill_sms_credit(
        Arg                    $input,
        EntityManagerInterface $em,
        SmsCreditRepository    $smsCreditRepository,
        SmsNotifier            $notifier,
        User                   $viewer,
        GlobalIdResolver       $globalIdResolver,
        SmsOrder               $smsOrder,
        FormFactoryInterface   $formFactory,
        FormInterface          $form
    )
    {
        $smsOrderId = 'smsOrderId';
        $input->offsetGet('smsOrder')->shouldBeCalledOnce()->willReturn($smsOrderId);
        $globalIdResolver->resolve($smsOrderId, $viewer)->shouldBeCalledOnce()->willReturn($smsOrder);

        $values = [
            'amount' => 1000,
            'smsOrder' => $smsOrderId
        ];
        $input->getArrayCopy()->shouldBeCalledOnce()->willReturn($values);

        $smsCredit = new SmsCredit();
        $formFactory->create(SmsCreditType::class, Argument::type(SmsCredit::class))->willReturn($form)->shouldBeCalledOnce();
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->shouldBeCalledOnce()->willReturn(true);

        $smsOrder->setIsProcessed(true)->shouldBeCalledOnce();
        $em->persist($smsOrder)->shouldBeCalledOnce();
        $em->persist($smsCredit)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $smsCreditRepository->countAll()->shouldBeCalledOnce()->willReturn(1);
        $notifier->onRefillSmsCredit($smsCredit)->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['smsCredit']->shouldHaveType(SmsCredit::class);
    }

    public function it_should_return_sms_order_not_found_error_code(
        Arg                    $input,
        User                   $viewer,
        GlobalIdResolver       $globalIdResolver
    )
    {
        $smsOrderId = 'smsOrderId';
        $input->offsetGet('smsOrder')->shouldBeCalledOnce()->willReturn($smsOrderId);
        $globalIdResolver->resolve($smsOrderId, $viewer)->shouldBeCalledOnce()->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['errorCode']->shouldBe(AddSmsCreditMutation::SMS_ORDER_NOT_FOUND);
    }

    public function it_should_return_sms_order_already_processed_error_code(
        Arg                    $input,
        User                   $viewer,
        GlobalIdResolver       $globalIdResolver,
        SmsOrder               $smsOrder,
        FormFactoryInterface   $formFactory,
        FormInterface          $form
    )
    {
        $smsOrderId = 'smsOrderId';
        $input->offsetGet('smsOrder')->shouldBeCalledOnce()->willReturn($smsOrderId);
        $globalIdResolver->resolve($smsOrderId, $viewer)->shouldBeCalledOnce()->willReturn($smsOrder);

        $values = [
            'amount' => 1000,
            'smsOrder' => $smsOrderId
        ];
        $input->getArrayCopy()->shouldBeCalledOnce()->willReturn($values);

        $formFactory->create(SmsCreditType::class, Argument::type(SmsCredit::class))->willReturn($form)->shouldBeCalledOnce();
        $form->submit($values, false)->shouldBeCalledOnce();
        $form->isValid()->shouldBeCalledOnce()->willReturn(false);

        $formError = new FormError('', 'This value is already used.');
        $formErrorIterator = new FormErrorIterator($form->getWrappedObject(), [$formError]);
        $form->getErrors(true, true)->shouldBeCalledOnce()->willReturn($formErrorIterator);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['errorCode']->shouldBe(AddSmsCreditMutation::ORDER_ALREADY_PROCESSED);
    }
}
