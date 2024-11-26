<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class VerifyUserPhoneNumberMutation implements MutationInterface
{
    use MutationTrait;

    final public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';

    private readonly EntityManagerInterface $em;
    private readonly SmsProviderInterface $smsProvider;
    private readonly UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository;

    public function __construct(
        EntityManagerInterface $em,
        SmsProviderFetcher $smsProviderFactory,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository
    ) {
        $this->em = $em;
        $this->smsProvider = $smsProviderFactory->fetch();
        $this->userPhoneVerificationSmsRepository = $userPhoneVerificationSmsRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        if ($viewer->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED];
        }

        $code = $input->offsetGet('code');
        $phone = $viewer->getPhone();
        $verifyErrorCode = $this->smsProvider->verifySms($phone, $code);
        if ($verifyErrorCode) {
            return ['errorCode' => $verifyErrorCode];
        }

        $viewer->setPhoneConfirmed(true);
        $userPhoneVerif = $this->userPhoneVerificationSmsRepository->findMostRecentSms($viewer);
        $userPhoneVerif->setApproved();
        $this->em->flush();

        return ['errorCode' => null, 'user' => $viewer];
    }
}
