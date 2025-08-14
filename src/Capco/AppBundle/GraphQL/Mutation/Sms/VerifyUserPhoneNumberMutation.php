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
use Symfony\Component\HttpKernel\KernelInterface;

class VerifyUserPhoneNumberMutation implements MutationInterface
{
    use MutationTrait;

    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    private SmsProviderInterface $smsProvider;

    public function __construct(
        private EntityManagerInterface $em,
        SmsProviderFetcher $smsProviderFactory,
        private UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        private KernelInterface $kernel
    ) {
        $this->smsProvider = $smsProviderFactory->fetch();
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $env = $this->kernel->getEnvironment();
        $this->formatInput($input);
        if ($viewer->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED];
        }

        $code = $input->offsetGet('code');
        $phone = $viewer->getPhone();

        if ('test' !== $env) {
            $verifyErrorCode = $this->smsProvider->verifySms($phone, $code);
            if ($verifyErrorCode) {
                return ['errorCode' => $verifyErrorCode];
            }
        }

        $viewer->setPhoneConfirmed(true);

        if ('test' !== $env) {
            $userPhoneVerif = $this->userPhoneVerificationSmsRepository->findMostRecentSms($viewer);
            $userPhoneVerif->setApproved();
        }

        $this->em->flush();

        return ['errorCode' => null, 'user' => $viewer];
    }
}
