<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Commentable;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\DataLoaderUtils;
use Capco\AppBundle\GraphQL\DataLoader\EntityRepositoryLinker;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Repository\EventCommentRepository;
use Capco\AppBundle\Repository\PostCommentRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Proxy\Proxy;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class CommentableCommentsDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        private readonly ProposalCommentRepository $proposalCommentRepository,
        private readonly EventCommentRepository $eventCommentRepository,
        private readonly PostCommentRepository $postCommentRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        parent::__construct(
            $this->all(...),
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $stopwatch,
            $enableCache
        );
    }

    public function invalidate(string $commentableId): void
    {
        $this->cache->invalidateTags([$commentableId]);
    }

    public function all(array $keys)
    {
        $results = [];
        if ($this->debug) {
            $this->logger->info(
                __METHOD__ .
                    'called for keys : ' .
                    var_export(
                        array_map(fn ($key) => $this->serializeKey($key), $keys),
                        true
                    )
            );
        }

        $entityIdMaps = $this->getEntitiesMapping($keys);
        //For the global query with all ids
        $viewer = $keys[0]['viewer'];
        $field = $keys[0]['orderBy']['field'] ?? 'PUBLISHED_AT';
        $direction = $keys[0]['orderBy']['direction'] ?? 'DESC';
        $offset = 0;
        //To get all comments
        $limit = 10000;

        $commentables = [];
        $totalCounts = [];
        $totalCountWithAnswersArray = [];
        //For each type of entity we do three queries to get all the:
        // - entities
        // - totalCounts
        // - totalCountsWithAnswers
        //We store the answer in an array with the type as a key to retrieve more quickly
        //each entity in the second step
        foreach ($entityIdMaps as $entityLinker) {
            $type = $entityLinker->getType();
            $entityKeys = $entityLinker->getEntities();
            $batchCommentableIds = array_map(fn ($key) => $key['commentable']->getId(), $entityKeys);

            $totalCounts[$type] = $entityLinker
                ->getRepository()
                ->countByCommentableIdsComments($type, $batchCommentableIds, $viewer)
            ;
            $totalCountWithAnswersArray[
                $type
            ] = $entityLinker
                ->getRepository()
                ->countCommentsAndAnswersByCommentableIds($type, $batchCommentableIds, $viewer)
            ;
            $commentables[$type] = $entityLinker
                ->getRepository()
                ->getByCommentableIds(
                    $type,
                    $batchCommentableIds,
                    $offset,
                    $limit,
                    $field,
                    $direction,
                    $viewer
                )
            ;
        }

        //We loop over $keys as we want to keep the same order for the answer as the user requested
        foreach ($keys as $key) {
            $type = $this->getRealClass($key['commentable']);
            //Thank to our mapping we search immediately our entity in an array containing only entities
            //of the same type.
            //We have to do it for the entities...
            $entitiesForKey = array_values(
                array_filter($commentables[$type], fn ($commentable) => $this->getIdAccordingToType($type, $commentable) ===
                    $key['commentable']->getId())
            );
            DataLoaderUtils::getAfterOffset($entitiesForKey, $key);
            DataLoaderUtils::getBeforeOffset($entitiesForKey, $key);
            $paginator = new Paginator(fn (int $offset, int $limit) => $entitiesForKey ?: []);
            //... for the totalCount...
            $totalCountKey = array_search(
                $key['commentable']->getId(),
                array_column($totalCounts[$type], 'commentable_id'),
                true
            );
            //... and for the totalCountWithAnswer
            $totalCountWithAnswersKey = array_search(
                $key['commentable']->getId(),
                array_column($totalCountWithAnswersArray[$type], 'commentable_id'),
                true
            );

            $totalCount =
                false !== $totalCountKey
                    ? (int) $totalCounts[$type][$totalCountKey]['totalCount']
                    : 0;
            $totalCountWithAnswers =
                false !== $totalCountWithAnswersKey
                    ? (int) $totalCountWithAnswersArray[$type][$totalCountWithAnswersKey][
                        'totalCount'
                    ]
                    : 0;

            $connection = $paginator->auto($key['args'], $totalCount);
            $connection->{'totalCountWithAnswers'} = $totalCountWithAnswers;
            $results[] = $connection;
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    public function getEntitiesMapping(array $keys): array
    {
        $entityIdMaps = [];
        foreach ($keys as $key) {
            $className = $this->getRealClass($key['commentable']);
            if (!isset($entityIdMaps[$className])) {
                $entityIdMaps[$className] = new EntityRepositoryLinker(
                    $className,
                    $this->getCommentableRepositoryWithType($className),
                    []
                );
            }
            $entityIdMaps[$className]->addEntity($key);
        }

        return $entityIdMaps;
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
                ->getArrayCopy()
            ;
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
            'args' => $key['args']->getArrayCopy(),
        ];
    }

    protected function getCacheTag($key): array
    {
        return [$key['commentable']->getId()];
    }

    private function getIdAccordingToType(string $type, $commentable): ?string
    {
        switch ($type) {
            case Proposal::class:
                return $commentable->getProposal()->getId();

            case ProposalComment::class:
                return $commentable->getParent()->getId();

            case Event::class:
                return $commentable->getEvent()->getId();

            case EventComment::class:
                return $commentable->getParent()->getId();

            case Post::class:
                return $commentable->getPost()->getId();

            case PostComment::class:
                return $commentable->getParent()->getId();

            default:
                return null;
        }
    }

    private function getCommentableRepositoryWithType(string $type): ?EntityRepository
    {
        switch ($type) {
            case Proposal::class:
            case ProposalComment::class:
                return $this->proposalCommentRepository;

            case Event::class:
            case EventComment::class:
                return $this->eventCommentRepository;

            case Post::class:
            case PostComment::class:
                return $this->postCommentRepository;

            default:
                return null;
        }
    }

    private function getCommentableRepository(CommentableInterface $commentable): ?EntityRepository
    {
        return match (true) {
            $commentable instanceof Proposal, $commentable instanceof ProposalComment => $this->proposalCommentRepository,
            $commentable instanceof Event, $commentable instanceof EventComment => $this->eventCommentRepository,
            $commentable instanceof Post, $commentable instanceof PostComment => $this->postCommentRepository,
            default => null,
        };
    }

    private function getRealClass($object): string
    {
        if ($object instanceof Proxy) {
            $reflect = new \ReflectionClass($object);
            // This gets the real object, the one that the Proxy extends
            return $reflect->getParentClass()->name;
        }

        return $object::class;
    }
}
