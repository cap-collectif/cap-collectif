<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Commentable;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Repository\EventCommentRepository;
use Capco\AppBundle\Repository\PostCommentRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

class CommentableCommentsDataLoader extends BatchDataLoader
{
    private $proposalCommentRepository;
    private $eventCommentRepository;
    private $postCommentRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisCache $cache,
        LoggerInterface $logger,
        ProposalCommentRepository $proposalCommentRepository,
        EventCommentRepository $eventCommentRepository,
        PostCommentRepository $postCommentRepository,
        string $cachePrefix,
        int $cacheTtl = RedisCache::ONE_MINUTE
    ) {
        $this->proposalCommentRepository = $proposalCommentRepository;
        $this->eventCommentRepository = $eventCommentRepository;
        $this->postCommentRepository = $postCommentRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl
        );
    }

    public function invalidate(string $commentId): void
    {
        foreach ($this->getCacheKeys() as $cacheKey) {
            $decoded = $this->getDecodedKeyFromKey($cacheKey);
            if (false !== strpos($decoded, $commentId)) {
                $this->cache->deleteItem($cacheKey);
                $this->clear($cacheKey);
                $this->logger->info('Invalidated cache for commentable ' . $commentId);
            }
        }
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $this->logger->info(
                __METHOD__ . ' called with ' . var_export($this->serializeKey($key), true)
            );

            $connections[] = $this->resolve($key['commentable'], $key['args'], $key['viewer']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key)
    {
        if (\is_string($key)) {
            return $key;
        }

        return [
            'commentableId' => $key['commentable']->getId(),
            'isAdmin' => $key['viewer'] ? $key['viewer']->isAdmin() : false,
            'args' => $key['args'],
        ];
    }

    private function resolve(CommentableInterface $commentable, Argument $args, $viewer): Connection
    {
        /** @var ProposalCommentRepository $repository */
        $repository = $this->getCommentableRepository($commentable);
        $viewer = $viewer instanceof User ? $viewer : null;

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $repository,
            $commentable,
            $viewer,
            $args
        ) {
            list($field, $direction) = [
                $args->offsetGet('orderBy')['field'],
                $args->offsetGet('orderBy')['direction'],
            ];

            return $repository
                ->getByCommentable($commentable, $offset, $limit, $field, $direction, $viewer)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $repository->countCommentsByCommentable($commentable, $viewer);

        $totalCountWithAnswers = $repository->countCommentsAndAnswersByCommentable(
            $commentable,
            $viewer
        );

        $connection = $paginator->auto($args, $totalCount);

        $connection->{'totalCountWithAnswers'} = $totalCountWithAnswers;

        return $connection;
    }

    private function getCommentableRepository(CommentableInterface $commentable): EntityRepository
    {
        switch (true) {
            case $commentable instanceof Proposal:
            case $commentable instanceof ProposalComment:
                return $this->proposalCommentRepository;
            case $commentable instanceof Event:
            case $commentable instanceof EventComment:
                return $this->eventCommentRepository;
            case $commentable instanceof Post:
            case $commentable instanceof PostComment:
                return $this->postCommentRepository;
            default:
                return null;
        }
    }
}
