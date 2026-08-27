<?php

namespace Capco\Tests\GraphQL\Resolver\Query;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\SortField;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryUsersResolver;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Repository\UserRepository;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 */
class QueryUsersResolverTest extends TestCase
{
    /**
     * @dataProvider privacyFilterAccessProvider
     *
     * @param list<null|bool> $expectedFilters
     */
    public function testOnlyAdministratorsCanFilterUserPrivacyStatuses(
        bool $isAdmin,
        array $expectedFilters
    ): void {
        $orderBy = ['field' => SortField::CREATED_AT, 'direction' => OrderDirection::DESC];
        $userSearch = $this->createMock(UserSearch::class);
        $userSearch
            ->expects(self::once())
            ->method('getAllUsers')
            ->with(2, $orderBy, null, ...$expectedFilters)
            ->willReturn(new ElasticsearchPaginatedResult([], [], 0))
        ;

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker
            ->expects(self::once())
            ->method('isGranted')
            ->with(UserRole::ROLE_ADMIN)
            ->willReturn($isAdmin)
        ;

        $resolver = new QueryUsersResolver(
            $this->createMock(UserRepository::class),
            $this->createMock(QueryAnalyzer::class),
            $userSearch,
            $authorizationChecker
        );

        $resolver(
            new Argument([
                'first' => 1,
                'superAdmin' => true,
                'withDisabled' => true,
                'emailConfirmed' => false,
                'consentInternalCommunication' => true,
                'onlyProjectAdmins' => true,
                'orderBy' => $orderBy,
            ]),
            $this->createMock(ResolveInfo::class)
        );
    }

    /** @return iterable<string, array{bool, list<bool|null>}> */
    public static function privacyFilterAccessProvider(): iterable
    {
        yield 'anonymous' => [false, [false, false, null, null, null]];
        yield 'administrator' => [true, [true, true, false, true, true]];
    }
}
