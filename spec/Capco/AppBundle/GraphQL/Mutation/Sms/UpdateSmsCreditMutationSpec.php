<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\GraphQL\Mutation\Sms\UpdateSmsCreditMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class UpdateSmsCreditMutationSpec extends ObjectBehavior
{

    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver
    )
    {
        $this->beConstructedWith(
            $em,
            $globalIdResolver

        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateSmsCreditMutation::class);
    }

    public function it_should_update_sms_credit(
        Arg                    $input,
        EntityManagerInterface $em,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        SmsCredit $smsCredit
    )
    {
        $id = "abc";
        $amount = "2000";
        $input->offsetGet('id')->shouldBeCalledOnce()->willReturn($id);
        $input->offsetGet('amount')->shouldBeCalledOnce()->willReturn($amount);

        $globalIdResolver->resolve($id, $viewer)->shouldBeCalledOnce()->willReturn($smsCredit);

        $smsCredit->setAmount($amount)->shouldBeCalledOnce();

        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(2);
        $payload['smsCredit']->shouldHaveType(SmsCredit::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_return_sms_credit_not_found_error_code(
        Arg                    $input,
        EntityManagerInterface $em,
        User $viewer,
        GlobalIdResolver $globalIdResolver
    )
    {
        $id = "not_found_id";
        $amount = "2000";
        $input->offsetGet('id')->shouldBeCalledOnce()->willReturn($id);
        $input->offsetGet('amount')->shouldBeCalledOnce()->willReturn($amount);

        $globalIdResolver->resolve($id, $viewer)->shouldBeCalledOnce()->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(2);
        $payload['smsCredit']->shouldBe(null);
        $payload['errorCode']->shouldBe(UpdateSmsCreditMutation::SMS_CREDIT_NOT_FOUND);
    }

}
