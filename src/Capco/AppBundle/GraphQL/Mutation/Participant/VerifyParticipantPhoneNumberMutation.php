<?php

namespace Capco\AppBundle\GraphQL\Mutation\Participant;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Enum\PhoneReconciliationMode;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\ParticipantPhoneVerificationSmsRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ParticipationWorkflow\PhoneContributorResolver;
use Capco\AppBundle\Service\ParticipationWorkflow\ProposalReconcillier;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\AppBundle\Service\ParticipationWorkflow\VotesReconcilier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\Security\Http\SecurityEvents;

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
        private ParticipantHelper $participantHelper,
        private PhoneContributorResolver $phoneContributorResolver,
        private ReplyReconcilier $replyReconcilier,
        private VotesReconcilier $votesReconcilier,
        private ProposalReconcillier $proposalReconcillier,
        private LoginManagerInterface $loginManager,
        private TokenStorageInterface $tokenStorage,
        private RequestStack $requestStack,
        private EventDispatcherInterface $eventDispatcher,
        private string $firewallName
    ) {
        $this->smsProvider = $smsProviderFactory->fetch();
    }

    /**
     * @return array{'errorCode': string|null, 'participant': Participant|null, 'reconciliationMode': string}
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
            return [
                'errorCode' => self::PHONE_ALREADY_CONFIRMED,
                'participant' => $participant,
                'reconciliationMode' => PhoneReconciliationMode::NONE,
            ];
        }

        $code = $input->offsetGet('code');
        $phone = $participant->getPhone();

        if ('test' !== $env) {
            $verifyErrorCode = $this->smsProvider->verifySms($phone, $code);
            if ($verifyErrorCode) {
                return [
                    'errorCode' => $verifyErrorCode,
                    'participant' => $participant,
                    'reconciliationMode' => PhoneReconciliationMode::NONE,
                ];
            }
        }

        $participant->setPhoneConfirmed(true);

        if ('test' !== $env) {
            $participantPhoneVerif = $this->participantPhoneVerificationSmsRepository->findMostRecentSms($participant);
            $participantPhoneVerif->setApproved();
        }

        $matchedUser = $this->phoneContributorResolver->findConfirmedUserByPhone($participant);
        if ($matchedUser instanceof User) {
            $this->entityManager->flush();
            $this->authenticateUser($matchedUser);

            return [
                'errorCode' => null,
                'participant' => null,
                'reconciliationMode' => PhoneReconciliationMode::USER_AUTHENTICATED,
            ];
        }

        $matchedParticipant = $this->phoneContributorResolver->findConfirmedParticipantByPhone($participant);
        if ($matchedParticipant instanceof Participant) {
            $this->reconcileParticipantContributions($participant, $matchedParticipant);
            $this->replyReconcilier->updateParticipantInfos($matchedParticipant, $participant);
            $this->transferPhoneVerificationSms($participant, $matchedParticipant);
            $this->entityManager->remove($participant);
            $this->entityManager->flush();

            return [
                'errorCode' => null,
                'participant' => $matchedParticipant,
                'reconciliationMode' => PhoneReconciliationMode::PARTICIPANT_MERGED,
            ];
        }

        $this->entityManager->flush();

        return [
            'errorCode' => null,
            'participant' => $participant,
            'reconciliationMode' => PhoneReconciliationMode::NONE,
        ];
    }

    private function authenticateUser(User $user): void
    {
        $this->loginManager->logInUser($this->firewallName, $user, null);

        $request = $this->requestStack->getCurrentRequest();
        $token = $this->tokenStorage->getToken();

        if (!$request || !$token) {
            return;
        }

        $event = new InteractiveLoginEvent($request, $token);
        $this->eventDispatcher->dispatch($event, SecurityEvents::INTERACTIVE_LOGIN);
    }

    private function reconcileParticipantContributions(Participant $participant, ContributorInterface $contributorTarget): void
    {
        $this->replyReconcilier->reconcile($participant, $contributorTarget);
        $this->proposalReconcillier->reconcile($participant, $contributorTarget);
        $this->votesReconcilier->reconcile($participant, $contributorTarget);
    }

    private function transferPhoneVerificationSms(Participant $sourceParticipant, Participant $targetParticipant): void
    {
        $phoneVerificationSmsList = $this->participantPhoneVerificationSmsRepository->findBy([
            'participant' => $sourceParticipant,
        ]);

        foreach ($phoneVerificationSmsList as $phoneVerificationSms) {
            $phoneVerificationSms->setParticipant($targetParticipant);
        }
    }
}
