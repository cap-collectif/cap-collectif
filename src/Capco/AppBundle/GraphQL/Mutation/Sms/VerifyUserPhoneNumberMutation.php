<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Enum\PhoneReconciliationMode;
use Capco\AppBundle\Enum\VerifySMSErrorCode;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\AppBundle\Service\ParticipationWorkflow\PhoneContributorResolver;
use Capco\AppBundle\Service\ParticipationWorkflow\ProposalReconcillier;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\AppBundle\Service\ParticipationWorkflow\VotesReconcilier;
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
        private KernelInterface $kernel,
        private PhoneContributorResolver $phoneContributorResolver,
        private ReplyReconcilier $replyReconcilier,
        private VotesReconcilier $votesReconcilier,
        private ProposalReconcillier $proposalReconcillier
    ) {
        $this->smsProvider = $smsProviderFactory->fetch();
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $env = $this->kernel->getEnvironment();
        $this->formatInput($input);
        if ($viewer->isPhoneConfirmed()) {
            return [
                'errorCode' => self::PHONE_ALREADY_CONFIRMED,
                'reconciliationMode' => PhoneReconciliationMode::NONE,
            ];
        }

        $code = $input->offsetGet('code');
        $phone = $viewer->getPhone();

        if ('test' !== $env) {
            $verifyErrorCode = $this->smsProvider->verifySms($phone, $code);
            if ($verifyErrorCode) {
                return [
                    'errorCode' => $verifyErrorCode,
                    'reconciliationMode' => PhoneReconciliationMode::NONE,
                ];
            }
        }

        $viewer->setPhoneConfirmed(true);

        if ('test' !== $env) {
            $userPhoneVerif = $this->userPhoneVerificationSmsRepository->findMostRecentSms($viewer);
            $userPhoneVerif->setApproved();
        }

        $matchingUser = $this->phoneContributorResolver->findConfirmedUserByPhone($viewer);
        if ($matchingUser instanceof User) {
            return [
                'errorCode' => VerifySMSErrorCode::PHONE_ALREADY_USED_BY_ANOTHER_USER,
                'reconciliationMode' => PhoneReconciliationMode::NONE,
            ];
        }

        $reconciliationMode = PhoneReconciliationMode::NONE;
        $matchingParticipant = $this->phoneContributorResolver->findConfirmedParticipantByPhone($viewer);
        if ($matchingParticipant instanceof Participant) {
            $this->replyReconcilier->reconcile($matchingParticipant, $viewer);
            $this->proposalReconcillier->reconcile($matchingParticipant, $viewer);
            $this->votesReconcilier->reconcile($matchingParticipant, $viewer);
            $this->em->remove($matchingParticipant);
            $reconciliationMode = PhoneReconciliationMode::PARTICIPANT_MERGED;
        }

        $this->em->flush();

        return [
            'errorCode' => null,
            'user' => $viewer,
            'reconciliationMode' => $reconciliationMode,
        ];
    }
}
