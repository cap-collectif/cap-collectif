<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\GraphQL\Mutation\Sms\DeleteSmsOrderMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class DeleteSmsOrderMutationSpec extends ObjectBehavior
{
    public function let(EntityManagerInterface $em, GlobalIdResolver $globalIdResolver)
    {
        $this->beConstructedWith($em, $globalIdResolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteSmsOrderMutation::class);
    }

    public function it_should_delete_sms_order(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        SmsOrder $smsOrder
    ) {
        $id = 'abc';
        $input
            ->offsetGet('id')
            ->shouldBeCalledOnce()
            ->willReturn($id);
        $globalIdResolver
            ->resolve($id, $viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsOrder);

        $em->remove($smsOrder)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $this->__invoke($input, $viewer)->shouldReturn(['errorCode' => null]);
    }

    public function it_should_return_not_found_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        User $viewer
    ) {
        $id = 'abc';
        $input
            ->offsetGet('id')
            ->shouldBeCalledOnce()
            ->willReturn($id);
        $globalIdResolver
            ->resolve($id, $viewer)
            ->shouldBeCalledOnce()
            ->willReturn(null);

        $this->__invoke($input, $viewer)->shouldReturn([
            'errorCode' => DeleteSmsOrderMutation::SMS_ORDER_NOT_FOUND,
        ]);
    }
}
