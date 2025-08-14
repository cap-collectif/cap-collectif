<?php

namespace Capco\AppBundle\GraphQL\Mutation\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\ParticipantPhoneVerificationSmsRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class SendParticipantPhoneValidationCodeMutation implements MutationInterface
{
    use MutationTrait;

    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    private const RETRY_PER_MINUTE = 2;
    private SmsProviderInterface $smsProvider;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        SmsProviderFetcher $smsProviderFactory,
        private readonly ParticipantPhoneVerificationSmsRepository $participantPhoneVerificationSmsRepository,
        private readonly ParticipantRepository $participantRepository,
        private readonly KernelInterface $kernel
    ) {
        $this->smsProvider = $smsProviderFactory->fetch();
    }

    /**
     * @return array|null[]|string[]
     */
    public function __invoke(Argument $input): array
    {
        $env = $this->kernel->getEnvironment();
        $this->formatInput($input);

        $base64Token = $input->offsetGet('token');
        $phone = $input->offsetGet('phone');
        $phone = $this->parsePhone($phone);
        $token = base64_decode((string) $base64Token);

        /** @var Participant $participant */
        $participant = $this->participantRepository->findOneBy(['token' => $token]);
        $participant->setPhone($phone);

        if ($participant->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED];
        }

        if (!$this->canRetry($participant)) {
            return ['errorCode' => self::RETRY_LIMIT_REACHED];
        }

        // do not send code in test env
        if ('test' === $env) {
            return ['errorCode' => null];
        }

        $sendVerificationSmsErrorCode = $this->smsProvider->sendVerificationSms($phone);
        if ($sendVerificationSmsErrorCode) {
            return ['errorCode' => $sendVerificationSmsErrorCode];
        }

        $participantPhoneVerificationSms = (new ParticipantPhoneVerificationSms())
            ->setParticipant($participant)
            ->setPending()
        ;
        $this->entityManager->persist($participantPhoneVerificationSms);
        $this->entityManager->flush();

        return ['errorCode' => null];
    }

    private function parsePhone(string $phone): string
    {
        if (str_starts_with($phone, '0')) {
            return '+33' . substr($phone, 1);
        }

        return $phone;
    }

    /**
     * Check whether you can re-send a sms
     * The rule is : max 2 sms sent within 1 minute.
     */
    private function canRetry(Participant $participant): bool
    {
        $participantPhoneVerificationSmsList = $this->participantPhoneVerificationSmsRepository->findSmsWithinOneMinuteRange(
            $participant
        );

        return \count($participantPhoneVerificationSmsList) < self::RETRY_PER_MINUTE;
    }
}
