<?php

namespace Capco\Tests\GraphQL\Resolver\Query;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\EventOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryEventsResolver;
use Capco\AppBundle\Search\EventSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 */
class QueryEventsResolverTest extends TestCase
{
    public function testAnonymousViewerCannotRetrieveDisabledEvents(): void
    {
        $eventSearch = $this->createMock(EventSearch::class);
        $eventSearch
            ->expects(self::once())
            ->method('searchEvents')
            ->with(
                null,
                2,
                null,
                ['enabled' => true],
                ['field' => EventOrderField::START_AT, 'direction' => OrderDirection::ASC]
            )
            ->willReturn(new ElasticsearchPaginatedResult([], [], 0))
        ;

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker
            ->expects(self::once())
            ->method('isGranted')
            ->with(UserRole::ROLE_ADMIN)
            ->willReturn(false)
        ;

        $resolver = new QueryEventsResolver(
            $eventSearch,
            $this->createMock(LoggerInterface::class),
            $this->createMock(QueryAnalyzer::class),
            $authorizationChecker
        );

        $resolver->getEventsConnection(new Argument(['first' => 1, 'enabled' => false]));
    }
}
