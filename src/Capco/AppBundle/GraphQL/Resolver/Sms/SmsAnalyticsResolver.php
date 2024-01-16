<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sms;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SmsAnalyticsResolver implements QueryInterface
{
    use ResolverTrait;

    private SmsAnalyticsHelper $smsAnalyticsHelper;

    public function __construct(SmsAnalyticsHelper $smsAnalyticsHelper)
    {
        $this->smsAnalyticsHelper = $smsAnalyticsHelper;
    }

    public function __invoke(?Argument $args = null): array
    {
        return [
            'remainingCredits' => [
                'amount' => $this->smsAnalyticsHelper->getRemainingCreditsAmount(),
                'status' => $this->smsAnalyticsHelper->getRemainingCreditsStatus(),
            ],
            'consumedCredits' => $this->smsAnalyticsHelper->getConsumedCredits(),
            'totalCredits' => $this->smsAnalyticsHelper->getTotalCredits(),
        ];
    }
}
