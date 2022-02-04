<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class VerifyUserPhoneNumberMutation implements MutationInterface
{
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    public const CODE_EXPIRED = 'CODE_EXPIRED';
    public const CODE_NOT_VALID = 'CODE_NOT_VALID';

    private EntityManagerInterface $em;
    private UserPhoneVerificationSmsRepository $userPhoneVerificationRepository;

    public function __construct(
        EntityManagerInterface $em,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository
    ) {
        $this->em = $em;
        $this->userPhoneVerificationRepository = $userPhoneVerificationRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        if ($viewer->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED];
        }

        $code = $input->offsetGet('code');

        $mostRecentSms = $this->userPhoneVerificationRepository->findMostRecentSms($viewer);

        if (!$mostRecentSms || $mostRecentSms->getCode() !== $code) {
            return ['errorCode' => self::CODE_NOT_VALID];
        }

        if ($mostRecentSms->isExpired()) {
            return ['errorCode' => self::CODE_EXPIRED];
        }

        $viewer->setPhoneConfirmed(true);
        $this->em->flush();

        return ['errorCode' => null, 'user' => $viewer];
    }
}
