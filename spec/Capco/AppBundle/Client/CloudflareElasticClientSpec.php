<?php

namespace spec\Capco\AppBundle\Client;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Elastica\Multi\ResultSet;
use Capco\AppBundle\Client\CloudflareElasticClient;

class CloudflareElasticClientSpec extends ObjectBehavior
{
    public function let(LoggerInterface $logger, LoggerInterface $esLogger)
    {
        $this->beConstructedWith($logger, $esLogger, '', '', '', '', '', '', '', '');
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

        $results = $this->getExternalAnalyticsSearches($startAt, $endAt, null, $requestedFields);
        $results->shouldHaveKey('mostVisitedPages');
        $results->shouldNotHaveKey('pageViews');
        $results->shouldNotHaveKey('visitors');
    }
}
