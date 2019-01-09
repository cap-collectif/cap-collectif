<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Commentable;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Model\CommentableInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\Repository\PostCommentRepository;
use Capco\AppBundle\Repository\EventCommentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class CommentableCommentsDataLoader extends BatchDataLoader
{
    private $proposalCommentRepository;
    private $eventCommentRepository;
    private $postCommentRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCommentRepository $proposalCommentRepository,
        EventCommentRepository $eventCommentRepository,
        PostCommentRepository $postCommentRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
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
            $cacheTtl,
            $debug,
            $enableCache
        );
    }

    public function invalidate(string $commentId): void
    {
        // TODO
        $this->invalidateAll();
    }

    public function all(array $keys)
    {
        $results = [];

        foreach ($keys as $key) {
            if ($this->debug) {
                $this->logger->info(
                    __METHOD__ . ' called with ' . var_export($this->serializeKey($key), true)
                );
            }

            $results[] = $this->resolve($key['commentable'], $key['args'], $key['viewer']);
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    public function resolve(CommentableInterface $commentable, Argument $args, $viewer): Connection
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
            if (0 === $offset && 0 === $limit) {
                return [];
            }
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

    protected function serializeKey($key): array
    {
        return [
            'commentableId' => $key['commentable']->getId(),
            'isAdmin' => $key['viewer'] ? $key['viewer']->isAdmin() : false,
            'args' => $key['args'],
        ];
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
