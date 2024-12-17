<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\GraphQL\Mutation\CheckIdentificationCodeMutation;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use DG\BypassFinals;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

BypassFinals::enable();

class CheckIdentificationCodeMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        LoggerInterface $logger,
        ValidatorInterface $validator,
        RateLimiter $rateLimiter,
        UserIdentificationCodeRepository $userIdentificationCodeRepository
    ) {
        $this->beConstructedWith($logger, $validator, $rateLimiter, $userIdentificationCodeRepository);
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
        RateLimiter $rateLimiter,
        ConstraintViolationList $violationList,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->initMutation(
            $arguments,
            $viewer,
            $validator,
            $violationList,
            $userIdentificationCodeRepository,
            $userIdentificationCode,
            'UNSUPERCODE_QUI_FAIT_AU_MOINS_32_CHARS_QUI_FAIT_AU_MOINS_32_CHARS'
        );
        $this->firstCallOfCache($rateLimiter, $viewer);
        $error->count()->willReturn(0);

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
        RateLimiter $rateLimiter,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->initMutation($arguments, $viewer, $validator, $violationList, $userIdentificationCodeRepository, $userIdentificationCode);
        $viewer
            ->getUserIdentificationCodeValue()
            ->willReturn('UNSUPERCODE_QUI_FAIT_AU_MOINS_32_CHARS')
        ;

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
        RateLimiter $rateLimiter,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->initMutation($arguments, $viewer, $validator, $violationList, $userIdentificationCodeRepository, $userIdentificationCode);
        $this->firstCallOfCache($rateLimiter, $viewer);

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
        RateLimiter $rateLimiter,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->initMutation($arguments, $viewer, $validator, $violationList, $userIdentificationCodeRepository, $userIdentificationCode);
        $validator
            ->validate(
                'UNSUPERCODE_QUI_FAIT_AU_MOINS_32_CHARS',
                Argument::type(CheckIdentificationCode::class)
            )
            ->willReturn($violationList)
        ;
        $this->firstCallOfCache($rateLimiter, $viewer);

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
        RateLimiter $rateLimiter,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->initMutation($arguments, $viewer, $validator, $violationList, $userIdentificationCodeRepository, $userIdentificationCode);

        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn(false)
        ;

        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => 'RATE_LIMIT_REACHED',
        ]);
    }

    public function it_lock_for_five_minutes(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        ConstraintViolation $violation,
        RateLimiter $rateLimiter,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->initMutation($arguments, $viewer, $validator, $violationList, $userIdentificationCodeRepository, $userIdentificationCode);

        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn(false)
        ;

        $this->__invoke($arguments, $viewer)->shouldBe([
            'user' => $viewer,
            'errorCode' => 'RATE_LIMIT_REACHED',
        ]);
    }

    public function initMutation(
        Arg $arguments,
        User $viewer,
        ValidatorInterface $validator,
        ConstraintViolationList $violationList,
        UserIdentificationCodeRepository $userIdentificationCodeRepository,
        UserIdentificationCode $userIdentificationCode,
        string $code = 'UNSUPERCODE_QUI_FAIT_AU_MOINS_32_CHARS'
    ): void {
        $argumentsValues = ['identificationCode' => $code];
        $arguments->getArrayCopy()->willReturn($argumentsValues);
        $viewer->getId()->willReturn('viewerId');
        $viewer->getUserIdentificationCodeValue()->willReturn(null);
        $userIdentificationCodeRepository
            ->find($code)
            ->willReturn($userIdentificationCode)
        ;

        $validator
            ->validate(
                $userIdentificationCode,
                Argument::type(CheckIdentificationCode::class)
            )
            ->willReturn($violationList)
        ;
    }

    private function firstCallOfCache(RateLimiter $rateLimiter, User $viewer)
    {
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn(true)
        ;
    }
}
