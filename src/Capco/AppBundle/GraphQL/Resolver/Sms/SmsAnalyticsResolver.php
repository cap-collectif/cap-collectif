<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sms;

use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\SmsCreditRepository ;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SmsAnalyticsResolver implements ResolverInterface
{
    use ResolverTrait;

    private SmsAnalyticsHelper $smsAnalyticsHelper;

    public function __construct(
        SmsAnalyticsHelper $smsAnalyticsHelper
    )
    {
        $this->smsAnalyticsHelper = $smsAnalyticsHelper;
    }

    public function __invoke(Argument $args = null): array
    {
        return [
            'remainingCredits' => [
                'amount' => $this->smsAnalyticsHelper->getRemainingCreditsAmount(),
                'status' => $this->smsAnalyticsHelper->getRemainingCreditsStatus()
            ],
            'consumedCredits' => $this->smsAnalyticsHelper->getConsumedCredits(),
            'totalCredits' => $this->smsAnalyticsHelper->getTotalCredits(),
        ];
    }
}

