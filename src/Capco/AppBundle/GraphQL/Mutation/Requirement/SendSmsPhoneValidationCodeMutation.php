<?php

namespace Capco\AppBundle\GraphQL\Mutation\Requirement;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Twilio\Exceptions\TwilioException;
use Symfony\Contracts\Translation\TranslatorInterface;

class SendSmsPhoneValidationCodeMutation implements MutationInterface
{
    public const UNDELIVERED = 'UNDELIVERED';
    public const INVALID_NUMBER = 'INVALID_NUMBER';
    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    public const MESSAGING_SERVICE_ID_NOT_FOUND = 'MESSAGING_SERVICE_ID_NOT_FOUND';

    private const RETRY_PER_MINUTE = 2;

    private EntityManagerInterface $em;
    private TwilioClient $twilioClient;
    private UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository;
    private TranslatorInterface $translator;
    private SiteParameterResolver $siteParameterResolver;

    public function __construct(
        EntityManagerInterface $em,
        TwilioClient $twilioClient,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        TranslatorInterface $translator,
        SiteParameterResolver $siteParameterResolver
    ) {
        $this->em = $em;
        $this->twilioClient = $twilioClient;
        $this->userPhoneVerificationSmsRepository = $userPhoneVerificationSmsRepository;
        $this->translator = $translator;
        $this->siteParameterResolver = $siteParameterResolver;
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

        $code = mt_rand(100000, 999999);
        $siteName = $this->siteParameterResolver->getValue('global.site.fullname');

        $body = $this->translator->trans(
            'phone.verify.sms.body',
            [
                'siteName' => $siteName,
                'code' => $code,
            ],
            'CapcoAppBundle'
        );

        $messagingServiceSid = $this->twilioClient->getServiceId();
        $userPhoneVerificationSms = $this->saveUserPhoneVerificationSms($code, $viewer);

        if (!$messagingServiceSid) {
            $this->updateUserPhoneVerificationSmsStatus($userPhoneVerificationSms, self::MESSAGING_SERVICE_ID_NOT_FOUND);
            return ['errorCode' => self::MESSAGING_SERVICE_ID_NOT_FOUND];
        }

        try {
            $message = $this->twilioClient->send($to, $body, $messagingServiceSid);

            $errorCode = $message->errorCode;
            $status = strtoupper($message->status);
            $this->updateUserPhoneVerificationSmsStatus($userPhoneVerificationSms, $status);

            if ($errorCode) {
                return ['errorCode' => self::UNDELIVERED];
            }

            return ['errorCode' => null];
        } catch (TwilioException $e) {
            if (TwilioClient::ERRORS['INVALID_TO_NUMBER'] === $e->getCode()) {
                $this->updateUserPhoneVerificationSmsStatus($userPhoneVerificationSms, self::INVALID_NUMBER);
                return ['errorCode' => self::INVALID_NUMBER];
            }

            return ['errorCode' => self::UNDELIVERED];
        }
    }

    /**
     * Check whether you can re-send a sms
     * The rule is : max 2 sms sent within 1 minute.
     */
    private function canRetry(User $viewer): bool
    {
        $userPhoneVerificationSmsList = $this->userPhoneVerificationSmsRepository->findByUserWithinOneMinuteRange($viewer);

        return \count($userPhoneVerificationSmsList) < self::RETRY_PER_MINUTE;
    }

    private function saveUserPhoneVerificationSms(string $code, User $viewer): UserPhoneVerificationSms
    {
        $userPhoneVerificationSms = new UserPhoneVerificationSms();
        $userPhoneVerificationSms->setCode($code);
        $userPhoneVerificationSms->setUser($viewer);
        $userPhoneVerificationSms->setStatus('WAITING_TO_BE_SENT');

        $this->em->persist($userPhoneVerificationSms);
        $this->em->flush();

        return $userPhoneVerificationSms;
    }

    private function updateUserPhoneVerificationSmsStatus(UserPhoneVerificationSms $userPhoneVerificationSms, string $status)
    {
        $userPhoneVerificationSms->setStatus($status);
        $this->em->flush();
    }
}
