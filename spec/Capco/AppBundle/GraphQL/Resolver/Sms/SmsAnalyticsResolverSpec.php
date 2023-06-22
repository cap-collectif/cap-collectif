<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Sms;

use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\GraphQL\Resolver\Sms\SmsAnalyticsResolver;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class SmsAnalyticsResolverSpec extends ObjectBehavior
{
    public function let(SmsAnalyticsHelper $smsAnalyticsHelper)
    {
        $this->beConstructedWith($smsAnalyticsHelper);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(SmsAnalyticsResolver::class);
    }

    public function it_should_return_sms_analytics(
        Argument $args,
        SmsAnalyticsHelper $smsAnalyticsHelper
    ) {
        $totalCredits = 5000;
        $consumedCredits = 200;
        $remainingCredits = 4800;
        $status = RemainingSmsCreditStatus::IDLE;

        $smsAnalyticsHelper
            ->getRemainingCreditsAmount()
            ->shouldBeCalledOnce()
            ->willReturn($remainingCredits);
        $smsAnalyticsHelper
            ->getRemainingCreditsStatus()
            ->shouldBeCalledOnce()
            ->willReturn($status);
        $smsAnalyticsHelper
            ->getTotalCredits()
            ->shouldBeCalledOnce()
            ->willReturn($totalCredits);
        $smsAnalyticsHelper
            ->getConsumedCredits()
            ->shouldBeCalledOnce()
            ->willReturn($consumedCredits);

        $this->__invoke($args)->shouldReturn([
            'remainingCredits' => [
                'amount' => $remainingCredits,
                'status' => $status,
            ],
            'consumedCredits' => $consumedCredits,
            'totalCredits' => $totalCredits,
        ]);
    }
}
