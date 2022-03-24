<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CheckIdentificationCodeMutation implements MutationInterface
{
    public const VIEWER_ALREADY_HAS_A_CODE = 'VIEWER_ALREADY_HAS_A_CODE';
    public const CODE_MINIMAL_LENGTH = 'CODE_MINIMAL_LENGTH';
    public const LIMIT_REACHED = 'LIMIT_REACHED';
    public const USER_CACHE_KEY = 'userCacheKey';
    protected LoggerInterface $logger;
    private ValidatorInterface $validator;
    private RedisCache $cache;

    public function __construct(
        LoggerInterface $logger,
        ValidatorInterface $validator,
        RedisCache $cache
    ) {
        $this->validator = $validator;
        $this->cache = $cache;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getArrayCopy();

        if ($user->getUserIdentificationCodeValue()) {
            return [
                'user' => $user,
                'errorCode' => self::VIEWER_ALREADY_HAS_A_CODE,
            ];
        }
        if (\strlen($arguments['identificationCode']) < self::CODE_MINIMAL_LENGTH) {
            return [
                'user' => $user,
                'errorCode' => CheckIdentificationCode::BAD_CODE,
            ];
        }
        // TODO in upgrade of Symfony https://symfony.com/doc/current/rate_limiter.html
        /** @var CacheItem $cachedItem */
        $cachedItem = $this->cache->getItem(self::USER_CACHE_KEY . '-' . $user->getId());
        $valueItem = $cachedItem->get();
        // first try
        if (!$cachedItem->isHit()) {
            $cachedItem->set(1)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
            // next try
        } elseif (self::LIMIT_REACHED === $valueItem) {
            return [
                'user' => $user,
                'errorCode' => self::LIMIT_REACHED,
            ];
        } elseif ($valueItem <= 10) {
            $cachedItem->set($valueItem + 1);
            $this->cache->save($cachedItem);
            // limit rate, user cant try for 5 minutes
        } else {
            $cachedItem->set(self::LIMIT_REACHED)->expiresAfter(5 * RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);

            return [
                'user' => $user,
                'errorCode' => self::LIMIT_REACHED,
            ];
        }

        // My form validation mus be wrong because, $form->getErrors() returns an empty array when I should have an error. So I do it this way
        $violationList = $this->validator->validate(
            strtoupper($arguments['identificationCode']),
            new CheckIdentificationCode()
        );
        if ($violationList->count()) {
            return [
                'user' => $user,
                'errorCode' => $violationList->offsetGet(0)->getMessage(),
            ];
        }

        return ['user' => $user, 'errorCode' => null];
    }
}
