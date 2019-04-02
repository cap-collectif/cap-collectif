<?php

namespace Capco\AppBundle\GraphQL\Resolver\User\OpenID;

use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserInfoResolver implements ResolverInterface
{
    private const REDIS_CACHE_KEY_ACCESS_TOKEN = 'OpenIDUserInfoAccessToken';
    private const REDIS_CACHE_KEY_USER_INFOS = 'OpenIDUserInfoUserInfos';

    protected $openIDresourceOwner;
    protected $redisCache;

    public function __construct(OpenIDResourceOwner $openIDresourceOwner, RedisCache $redisCache)
    {
        $this->openIDresourceOwner = $openIDresourceOwner;
        $this->redisCache = $redisCache;
    }

    public function __invoke(User $viewer): array
    {
        $accessTokenCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY_ACCESS_TOKEN . ' - ' . $viewer->getId()
        );

        if (!$accessTokenCachedItem->isHit()) {
            $accessTokenCachedItem
                ->set($viewer->getOpenIdAccessToken())
                ->expiresAfter($this->redisCache::ONE_MINUTE);
        }

        $accessToken = $accessTokenCachedItem->get();
        $userInfos = $this->openIDresourceOwner->getUserInformation($accessToken);

        if (!$userInfos) {
            return [];
        }

        $userInfosCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY_USER_INFOS . ' - ' . $viewer->getId()
        );

        if (!$userInfosCachedItem->isHit()) {
            $fields = $this->openIDresourceOwner->getOption('paths');
            $openIdUserInfos = [];

            foreach ($fields as $key => $field) {
                switch ($key) {
                    case 'first_name':
                        $openIdUserInfos['firstName'] = $userInfos->getFirstName();
                        break;
                    case 'last_name':
                        $openIdUserInfos['lastName'] = $userInfos->getLastName();
                        break;
                    case 'email':
                        $openIdUserInfos['email'] = $userInfos->getEmail();
                        break;
                    case 'nickname':
                        $openIdUserInfos['nickName'] = $userInfos->getLastName();
                        break;
                    default:break;
                }
            }

            $userInfosCachedItem
                ->set($openIdUserInfos)
                ->expiresAfter($this->redisCache::ONE_MINUTE);
        }

        return $userInfosCachedItem->get();
    }
}
