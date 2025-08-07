<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\PostOrderField;
use Capco\AppBundle\Repository\PostRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class QueryPostsResolver implements QueryInterface
{
    public function __construct(private readonly PostRepository $postRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $args): ConnectionInterface|Promise
    {
        $themeId = $args->offsetGet('theme')
            ? GlobalId::fromGlobalId($args->offsetGet('theme'))['id']
            : null;

        $projectId = $args->offsetGet('project')
            ? GlobalId::fromGlobalId($args->offsetGet('project'))['id']
            : null;

        $orderBy = $args->offsetExists('orderBy')
            ? $args->offsetGet('orderBy')
            : [
                'field' => PostOrderField::PUBLISHED_AT,
                'direction' => OrderDirection::DESC,
            ];

        try {
            $total = $this->postRepository->countPublicPosts($themeId, $projectId);
        } catch (NoResultException|NonUniqueResultException $e) {
            $this->logger->error($e->getMessage());
            $total = 0;
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($themeId, $projectId, $orderBy, $total) {
            if (0 === $total) {
                return [];
            }

            return $this->postRepository->getPublicPosts(
                themeId: $themeId,
                projectId: $projectId,
                offset: $offset,
                limit: $limit,
                orderBy: $orderBy,
            );
        });

        return $paginator->auto($args, $total);
    }
}
