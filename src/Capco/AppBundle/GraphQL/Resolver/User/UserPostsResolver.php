<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\PostSearch;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserPostsResolver implements ResolverInterface
{
    private $logger;
    private $postRepository;
    private PostSearch $postSearch;

    public function __construct(
        PostRepository $postRepository,
        LoggerInterface $logger,
        PostSearch $postSearch
    ) {
        $this->postRepository = $postRepository;
        $this->logger = $logger;
        $this->postSearch = $postSearch;
    }

    public function __invoke(User $user, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $affiliations = $args->offsetGet('affiliations') ?? [];
        $query = $args->offsetGet('query');
        $orderByField = $args->offsetGet('orderBy')['field'];
        $orderByDirection = $args->offsetGet('orderBy')['direction'];

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $user,
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection
        ) {
            try {
                return $this->postSearch->getUserPostsPaginated(
                    $user,
                    $query,
                    $affiliations,
                    $orderByField,
                    $orderByDirection,
                    $limit,
                    $cursor
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find contributors failed.');
            }
        });

        return $paginator->auto($args);
    }
}
