<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\Enum\SendSMSErrorCode;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class SendSmsPhoneValidationCodeMutation implements MutationInterface
{
    use MutationTrait;
    private const RETRY_PER_MINUTE = 2;
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
            return ['errorCode' => SendSMSErrorCode::PHONE_ALREADY_CONFIRMED];
        }

        if (!$this->canRetry($viewer)) {
            return ['errorCode' => SendSMSErrorCode::RETRY_LIMIT_REACHED];
        }

        $recipientNumber = $viewer->getPhone();

        if ('test' !== $env) {
            $sendVerificationSmsErrorCode = $this->smsProvider->sendVerificationSms($recipientNumber);
            if ($sendVerificationSmsErrorCode) {
                return ['errorCode' => $sendVerificationSmsErrorCode];
            }

            $userPhoneVerificationSms = (new UserPhoneVerificationSms())
                ->setUser($viewer)
                ->setPending()
            ;

            $this->em->persist($userPhoneVerificationSms);
            $this->em->flush();
        }

        return ['errorCode' => null];
    }

    /**
     * Check whether you can re-send a sms
     * The rule is : max 2 sms sent within 1 minute.
     */
    private function canRetry(User $viewer): bool
    {
        $userPhoneVerificationSmsList = $this->userPhoneVerificationSmsRepository->findSmsWithinOneMinuteRange(
            $viewer
        );

        return \count($userPhoneVerificationSmsList) < self::RETRY_PER_MINUTE;
    }
}
