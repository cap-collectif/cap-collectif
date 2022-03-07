<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Helper\TwilioClient;
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
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

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

        $code = $input->offsetGet('code');
        $phone = $viewer->getPhone();
        $response = $this->twilioClient->checkVerificationCode($phone, $code);

        $statusCode = $response['statusCode'];

        // see https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
        $apiErrorCode = 404 === $statusCode ? $response['data']['code'] : null;
        if ($apiErrorCode === TwilioClient::ERRORS['NOT_FOUND']) {
            return ['errorCode' => self::CODE_EXPIRED];
        }

        if (200 === $statusCode) {
            $verificationStatus = $response['data']['status'];
            if ('pending' === $verificationStatus) {
                return ['errorCode' => self::CODE_NOT_VALID];
            }

            $viewer->setPhoneConfirmed(true);
            $userPhoneVerif = $this->userPhoneVerificationSmsRepository->findMostRecentSms($viewer);
            $userPhoneVerif->setStatus($verificationStatus);
            $this->em->flush();

            return ['errorCode' => null, 'user' => $viewer];
        }

        return ['errorCode' => self::TWILIO_API_ERROR];
    }
}
