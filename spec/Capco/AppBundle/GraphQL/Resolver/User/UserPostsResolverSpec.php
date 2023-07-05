<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\PostOrderField;
use Capco\AppBundle\GraphQL\Resolver\User\UserPostsResolver;
use Capco\AppBundle\Search\PostSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class UserPostsResolverSpec extends ObjectBehavior
{
    public function let(LoggerInterface $logger, PostSearch $postSearch)
    {
        $this->beConstructedWith($logger, $postSearch);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UserPostsResolver::class);
    }

    public function it_should_fetch_user_posts_with_all_args_given(
        User $user,
        ElasticsearchPaginatedResult $paginatedResult,
        PostSearch $postSearch
    ) {
        $orderByField = 'UPDATED_AT';
        $orderByDirection = 'ASC';

        $affiliations = [];
        $query = 'posts';

        $orderBy = [
            'field' => $orderByField,
            'direction' => $orderByDirection,
        ];

        $totalCount = 10;

        $args = new Arg([
            'first' => 100,
            'after' => null,
            'orderBy' => $orderBy,
            'affiliations' => $affiliations,
            'query' => $query,
        ]);

        $paginatedResult->getEntities()->willReturn([]);
        $paginatedResult->getCursors()->willReturn([]);
        $paginatedResult->getTotalCount()->willReturn($totalCount);

        $postSearch
            ->getUserPostsPaginated(
                $user,
                101,
                $affiliations,
                null,
                $query,
                $orderByField,
                $orderByDirection
            )
            ->shouldBeCalled()
            ->willReturn($paginatedResult)
        ;

        $this->__invoke($user, $args)->shouldReturnConnection();
    }

    public function it_should_fetch_user_posts_with_default_values(
        User $user,
        ElasticsearchPaginatedResult $paginatedResult,
        PostSearch $postSearch
    ) {
        $totalCount = 10;
        $args = new Arg([
            'first' => 100,
            'after' => null,
        ]);

        $paginatedResult->getEntities()->willReturn([]);
        $paginatedResult->getCursors()->willReturn([]);
        $paginatedResult->getTotalCount()->willReturn($totalCount);

        $postSearch
            ->getUserPostsPaginated(
                $user,
                101,
                [],
                null,
                null,
                PostOrderField::UPDATED_AT,
                OrderDirection::DESC
            )
            ->shouldBeCalled()
            ->willReturn($paginatedResult)
        ;

        $this->__invoke($user, $args)->shouldReturnConnection();
    }
}
