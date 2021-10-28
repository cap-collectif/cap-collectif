<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\GraphQL\Mutation\CheckIdentificationCodeMutation;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
use DG\BypassFinals;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

BypassFinals::enable();

class CheckIdentificationCodeMutationSpec extends ObjectBehavior
{
    public function let(LoggerInterface $logger, ValidatorInterface $validator, RedisCache $cache)
    {
        $this->beConstructedWith($logger, $validator, $cache);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CheckIdentificationCodeMutation::class);
    }

    public function it_check_a_valid_user_identification_code(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $error,
        ConstraintViolation $violation,
        CacheItem $cachedItem,
        RedisCache $cache,
        ConstraintViolationList $violationList
    ) {
        $this->initMutation($arguments, $viewer, $validator, $violationList);
        $this->firstCallOfCache($cachedItem, $cache);
        $error->count()->willReturn(0);
        $validator
            ->validate('UnSuperCode', Argument::type(CheckIdentificationCode::class))
            ->willReturn($error);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => null,
        ]);
    }

    public function it_check_a_user_identification_code_but_user_already_has_code(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        ConstraintViolation $violation,
        CacheItem $cachedItem,
        RedisCache $cache
    ) {
        $this->initMutation($arguments, $viewer, $validator, $violationList);
        $viewer->getUserIdentificationCodeValue()->willReturn('UnSuperCode');

        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => 'VIEWER_ALREADY_HAS_A_CODE',
        ]);
    }

    public function it_check_a_bad_user_identification_code(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        ConstraintViolation $violation,
        CacheItem $cachedItem,
        RedisCache $cache
    ) {
        $this->initMutation($arguments, $viewer, $validator, $violationList);
        $this->firstCallOfCache($cachedItem, $cache);

        $violationList->count()->willReturn(1);
        $violationList->offsetGet(0)->willReturn($violation);

        $violation->getMessage()->willReturn(CheckIdentificationCode::BAD_CODE);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => CheckIdentificationCode::BAD_CODE,
        ]);
    }

    public function it_check_a_used_user_identification_code(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        ConstraintViolation $violation,
        CacheItem $cachedItem,
        RedisCache $cache
    ) {
        $this->initMutation($arguments, $viewer, $validator, $violationList);
        $validator
            ->validate('UnSuperCode', Argument::type(CheckIdentificationCode::class))
            ->willReturn($violationList);
        $this->firstCallOfCache($cachedItem, $cache);

        $violationList->count()->willReturn(1);
        $violationList->offsetGet(0)->willReturn($violation);

        $violation->getMessage()->willReturn(CheckIdentificationCode::CODE_ALREADY_USED);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => CheckIdentificationCode::CODE_ALREADY_USED,
        ]);
    }

    public function it_try_to_force_identification_code(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        CacheItem $cachedItem,
        RedisCache $cache
    ) {
        $this->initMutation($arguments, $viewer, $validator, $violationList);
        $cache
            ->getItem('userCacheKey-viewerId')
            ->willReturn($cachedItem)
            ->shouldBeCalled();
        $cachedItem->isHit()->willReturn(true);
        $cachedItem->get()->willReturn('LIMIT_REACHED');

        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => 'LIMIT_REACHED',
        ]);
    }

    public function it_lock_for_five_minutes(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        ConstraintViolation $violation,
        CacheItem $cachedItem,
        RedisCache $cache
    ) {
        $this->initMutation($arguments, $viewer, $validator, $violationList);
        $cache
            ->getItem('userCacheKey-viewerId')
            ->willReturn($cachedItem)
            ->shouldBeCalled();
        $cachedItem->get()->willReturn(11);
        $cachedItem->isHit()->willReturn(true);
        $cachedItem
            ->set('LIMIT_REACHED')
            ->shouldBeCalled()
            ->willReturn($cachedItem);
        $cachedItem
            ->expiresAfter(300)
            ->shouldBeCalled()
            ->willReturn($cachedItem);
        $cache
            ->save($cachedItem)
            ->willReturn(true)
            ->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => 'LIMIT_REACHED',
        ]);
    }

    public function initMutation(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList
    ) {
        $argumentsValues = ['identificationCode' => 'UnSuperCode'];
        $arguments->getArrayCopy()->willReturn($argumentsValues);
        $viewer->getId()->willReturn('viewerId');
        $viewer->getUserIdentificationCodeValue()->willReturn(null);
        $validator
            ->validate('UnSuperCode', Argument::type(CheckIdentificationCode::class))
            ->willReturn($violationList);
    }

    private function firstCallOfCache(
        CacheItem $cachedItem,
        RedisCache $cache
    ) {
        $cache
            ->getItem('userCacheKey-viewerId')
            ->willReturn($cachedItem)
            ->shouldBeCalled();
        $cachedItem->get()->willReturn(null);
        $cachedItem->isHit()->willReturn(false);
        $cachedItem
            ->set(1)
            ->shouldBeCalled()
            ->willReturn($cachedItem);
        $cachedItem
            ->expiresAfter(RedisCache::ONE_MINUTE)
            ->shouldBeCalled()
            ->willReturn($cachedItem);
        $cache
            ->save($cachedItem)
            ->willReturn(true)
            ->shouldBeCalled();
    }
}
