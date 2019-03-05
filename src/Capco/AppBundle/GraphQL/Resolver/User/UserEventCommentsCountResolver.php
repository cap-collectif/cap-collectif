<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserEventCommentsCountResolver implements ResolverInterface
{
    private const REDIS_CACHE_KEY = 'EventCommentsCount';
    protected $commentRepository;
    protected $redisCache;

    public function __construct(CommentRepository $commentRepository, RedisCache $redisCache)
    {
        $this->commentRepository = $commentRepository;
        $this->redisCache = $redisCache;
    }

    public function __invoke(User $viewer): int
    {
        $eventCommentsCountCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY . ' - ' . $viewer->getId()
        );

        if (!$eventCommentsCountCachedItem->isHit()) {
            $eventCommentsCountCachedItem
                ->set($this->commentRepository->getEventCommentsCount($viewer))
                ->expiresAfter($this->redisCache::ONE_MINUTE);
        }

        return $eventCommentsCountCachedItem->get();
    }
}
