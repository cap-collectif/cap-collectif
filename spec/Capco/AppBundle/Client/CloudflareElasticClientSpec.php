<?php

namespace spec\Capco\AppBundle\Client;

use Capco\AdminBundle\Timezone\GlobalConfigurationTimeZoneDetector;
use Capco\AppBundle\Client\CloudflareElasticClient;
use Elastica\Multi\ResultSet;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

/**
 * @extends ObjectBehavior<string, string>
 */
class CloudflareElasticClientSpec extends ObjectBehavior
{
    public function let(LoggerInterface $logger, LoggerInterface $esLogger, GlobalConfigurationTimeZoneDetector $timeZoneDetector): void
    {
        $timeZoneDetector->getTimezone()->willReturn('Europe/Paris');

        $this->beConstructedWith($logger, $esLogger, '', '', '', '', '', '', '', '', $timeZoneDetector);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(CloudflareElasticClient::class);
    }

    public function it_should_filter_searches(ResultSet $resultSet): void
    {
        $startAt = new \DateTime('2022-02-23 10:55:30');
        $endAt = new \DateTime('2022-02-23 10:55:30');
        $requestedFields = ['mostVisitedPages'];

        $searches = ['mostVisitedPages' => null];

        /** @phpstan-ignore-next-line */
        $results = $this->getExternalAnalyticsSearches($startAt, $endAt, null, $requestedFields);
        $results->shouldHaveKey('mostVisitedPages');
        $results->shouldNotHaveKey('pageViews');
        $results->shouldNotHaveKey('visitors');
    }
}
