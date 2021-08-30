<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\GraphQL\Resolver\Event\EventOwnerEventsResolver;
use Capco\AppBundle\Search\EventSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class EventOwnerEventsResolverSpec extends ObjectBehavior
{
    public function let(EventSearch $eventSearch, LoggerInterface $logger)
    {
        $this->beConstructedWith($eventSearch, $logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(EventOwnerEventsResolver::class);
    }

    public function it_should_fetch_events(
        ElasticsearchPaginatedResult $paginatedResult,
        EventSearch $eventSearch,
        User $viewer
    ) {
        $args = new Arg([
            'first' => 100,
            'orderBy' => [
                'field' => 'START_AT',
                'direction' => 'DESC',
            ],
            'search' => 'abc',
            'after' => null,
            'onlyWhenAuthor' => false,
        ]);
        $paginatedResult->getEntities()->willReturn([]);
        $paginatedResult->getCursors()->willReturn([]);
        $paginatedResult->getTotalCount()->willReturn(10);

        $eventSearch
            ->searchEvents(
                null,
                101,
                'abc',
                ['status' => null],
                [
                    'field' => 'START_AT',
                    'direction' => 'DESC',
                ],
                null,
                $viewer,
                false
            )
            ->shouldBeCalled()
            ->willReturn($paginatedResult);

        $this->__invoke($args, $viewer)->shouldReturnConnection();
    }
}
