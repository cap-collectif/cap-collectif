<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class SendSmsPhoneValidationCodeMutation implements MutationInterface
{
    public const INVALID_NUMBER = 'INVALID_NUMBER';
    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    private const RETRY_PER_MINUTE = 2;

    private EntityManagerInterface $em;
    private TwilioClient $twilioClient;
    private UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository;

    public function __construct(
        EntityManagerInterface $em,
        TwilioClient $twilioClient,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository
    ) {
        $this->em = $em;
        $this->twilioClient = $twilioClient;
        $this->userPhoneVerificationSmsRepository = $userPhoneVerificationSmsRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        if ($viewer->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED];
        }

        if (!$this->canRetry($viewer)) {
            return ['errorCode' => self::RETRY_LIMIT_REACHED];
        }

        $to = $viewer->getPhone();
        $response = $this->twilioClient->sendVerificationCode($to);
        $statusCode = $response['statusCode'];

        $apiErrorCode = 400 === $statusCode ? $response['data']['code'] : null;

        if ($apiErrorCode === TwilioClient::ERRORS['INVALID_PARAMETER'] || $apiErrorCode === TwilioClient::ERRORS['LANDLINE_NUMBER_NOT_SUPPORTED']) {
            return ['errorCode' => self::INVALID_NUMBER];
        }

        if (201 === $statusCode) {
            $status = $response['data']['status'];
            $this->saveUserPhoneVerificationSms($viewer, $status);

            return ['errorCode' => null];
        }

        return ['errorCode' => self::TWILIO_API_ERROR];
    }

    /**
     * Check whether you can re-send a sms
     * The rule is : max 2 sms sent within 1 minute.
     */
    private function canRetry(User $viewer): bool
    {
        $userPhoneVerificationSmsList = $this->userPhoneVerificationSmsRepository->findByUserWithinOneMinuteRange(
            $viewer
        );

        return \count($userPhoneVerificationSmsList) < self::RETRY_PER_MINUTE;
    }

    private function saveUserPhoneVerificationSms(User $viewer, string $status): void
    {
        $userPhoneVerificationSms = new UserPhoneVerificationSms();
        $userPhoneVerificationSms->setUser($viewer);
        $userPhoneVerificationSms->setStatus($status);

        $this->em->persist($userPhoneVerificationSms);
        $this->em->flush();
    }
}
