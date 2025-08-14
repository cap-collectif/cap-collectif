<?php

namespace Capco\AppBundle\GraphQL\Mutation\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\ParticipantPhoneVerificationSmsRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class VerifyParticipantPhoneNumberMutation implements MutationInterface
{
    use MutationTrait;

    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    private SmsProviderInterface $smsProvider;

    public function __construct(
        private EntityManagerInterface $entityManager,
        SmsProviderFetcher $smsProviderFactory,
        private ParticipantPhoneVerificationSmsRepository $participantPhoneVerificationSmsRepository,
        private KernelInterface $kernel,
        private ParticipantHelper $participantHelper
    ) {
        $this->smsProvider = $smsProviderFactory->fetch();
    }

    /**
     * @return array{'errorCode': string|null, 'participant': Participant|null}
     */
    public function __invoke(Argument $input): array
    {
        $env = $this->kernel->getEnvironment();
        $this->formatInput($input);

        $base64Token = $input->offsetGet('token');

        try {
            $participant = $this->participantHelper->getParticipantByToken($base64Token);
        } catch (ParticipantNotFoundException $e) {
            throw new UserError($e->getMessage());
        }

        if ($participant->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED, 'participant' => $participant];
        }

        $code = $input->offsetGet('code');
        $phone = $participant->getPhone();

        if ('test' !== $env) {
            $verifyErrorCode = $this->smsProvider->verifySms($phone, $code);
            if ($verifyErrorCode) {
                return ['errorCode' => $verifyErrorCode, 'participant' => $participant];
            }
        }

        $participant->setPhoneConfirmed(true);

        if ('test' !== $env) {
            $participantPhoneVerif = $this->participantPhoneVerificationSmsRepository->findMostRecentSms($participant);
            $participantPhoneVerif->setApproved();
        }

        $this->entityManager->flush();

        return ['errorCode' => null, 'participant' => $participant];
    }
}
