<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;
use Symfony\Contracts\Cache\CacheInterface;

class IndexableTypesRegistry implements CacheWarmerInterface
{
    private const CACHE_KEY = 'elasticsearch.indexable_types';

    /** @var null|array<string, class-string<IndexableInterface>> */
    private ?array $classes = null;

    public function __construct(
        private readonly ManagerRegistry $registry,
        private readonly CacheInterface $cache
    ) {}

    /**
     * @return array<string, class-string<IndexableInterface>>
     */
    public function getClasses(): array
    {
        return $this->classes ??= $this->cache->get(self::CACHE_KEY, function (): array {
            $classes = [];
            foreach ($this->registry->getManager()->getMetadataFactory()->getAllMetadata() as $metadata) {
                $class = $metadata->getName();
                if (is_a($class, IndexableInterface::class, true)) {
                    $classes[$class::getElasticsearchTypeName()] = $class;
                }
            }

            // Shared Elasticsearch types must resolve through their Doctrine root entity.
            $classes['comment'] = Comment::class;
            $classes['reply'] = Reply::class;
            $classes['vote'] = AbstractVote::class;
            $classes['response'] = AbstractResponse::class;
            $classes['district'] = AbstractDistrict::class;

            return $classes;
        });
    }

    public function isOptional(): bool
    {
        return false;
    }

    /**
     * @return list<string>
     */
    public function warmUp(string $cacheDir): array
    {
        // An explicit warmup also refreshes the map after entities are added or changed.
        $this->classes = null;
        $this->cache->delete(self::CACHE_KEY);
        $this->getClasses();

        return [];
    }
}
