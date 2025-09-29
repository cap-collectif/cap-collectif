<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CheckIdentificationCodeMutation implements MutationInterface
{
    use MutationTrait;

    final public const VIEWER_ALREADY_HAS_A_CODE = 'VIEWER_ALREADY_HAS_A_CODE';
    final public const CODE_MINIMAL_LENGTH = 8;
    final public const RATE_LIMITER_ACTION = 'CheckIdentificationCode';
    final public const RATE_LIMIT_REACHED = 'RATE_LIMIT_REACHED';

    public function __construct(
        protected LoggerInterface $logger,
        private readonly ValidatorInterface $validator,
        private readonly RateLimiter $rateLimiter,
        private readonly UserIdentificationCodeRepository $userIdentificationCodeRepository
    ) {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        if ($user->getUserIdentificationCodeValue()) {
            return [
                'user' => $user,
                'errorCode' => self::VIEWER_ALREADY_HAS_A_CODE,
            ];
        }
        if (\strlen((string) $arguments['identificationCode']) < self::CODE_MINIMAL_LENGTH) {
            return [
                'user' => $user,
                'errorCode' => CheckIdentificationCode::BAD_CODE,
            ];
        }

        if (false === $this->rateLimiter->canDoAction(self::RATE_LIMITER_ACTION, $user->getId())) {
            return [
                'user' => $user,
                'errorCode' => self::RATE_LIMIT_REACHED,
            ];
        }

        $userIdentificationCode = $this->userIdentificationCodeRepository->find($arguments['identificationCode']);

        if (!$userIdentificationCode) {
            return [
                'user' => $user,
                'errorCode' => CheckIdentificationCode::BAD_CODE,
            ];
        }

        // My form validation mus be wrong because, $form->getErrors() returns an empty array when I should have an error. So I do it this way
        $violationList = $this->validator->validate(
            $userIdentificationCode,
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
