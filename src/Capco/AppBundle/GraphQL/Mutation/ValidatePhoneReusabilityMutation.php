<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ParticipantPhoneVerificationSmsRepository;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\AppBundle\Service\ContributionValidator;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ValidatePhoneReusabilityMutation implements MutationInterface
{
    use MutationTrait;

    public const PHONE_ALREADY_USED = 'PHONE_ALREADY_USED';

    public function __construct(
        private readonly ContributionValidator $contributionValidator,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ParticipantHelper $participantHelper,
        private readonly ParticipantPhoneVerificationSmsRepository $participantPhoneVerificationSmsRepository,
        private readonly UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @return array{'errorCode': string|null}
     */
    public function __invoke(Argument $input, ?User $viewer = null): array
    {
        $this->formatInput($input);

        $participantToken = $input->offsetGet('participantToken');
        $contributionId = $input->offsetGet('contributionId');

        $contributor = $this->getContributor($viewer, $participantToken);
        $contribution = $this->getContribution($contributionId);
        $step = $contribution->getStep();

        try {
            $this->contributionValidator->validatePhoneReusability($contributor, $contribution, $step);
        } catch (ContributorAlreadyUsedPhoneException) {
            $this->updateLastSMSPhoneVerificationStatus($contributor);

            return ['errorCode' => self::PHONE_ALREADY_USED];
        }

        return ['errorCode' => null];
    }

    private function getContributor(?User $viewer = null, ?string $token = null): ContributorInterface
    {
        if ($viewer instanceof User) {
            return $viewer;
        }

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException $e) {
            throw new UserError($e->getMessage());
        }

        return $participant;
    }

    private function getContribution(string $contributionId): ContributionInterface
    {
        $contribution = $this->globalIdResolver->resolve($contributionId);

        if (!$contribution instanceof ContributionInterface) {
            throw new UserError(sprintf('Contribution with ID %s not found.', $contributionId));
        }

        return $contribution;
    }

    private function updateLastSMSPhoneVerificationStatus(ContributorInterface $contributor): void
    {
        if ($contributor instanceof Participant) {
            /** * @var ParticipantPhoneVerificationSms $log */
            $log = $this->participantPhoneVerificationSmsRepository->findLastByCreatedAtAndParticipant($contributor);
            $log?->setAlreadyConfirmed();
        } elseif ($contributor instanceof User) {
            /** * @var ParticipantPhoneVerificationSms $log */
            $log = $this->userPhoneVerificationSmsRepository->findLastByCreatedAtAndParticipant($contributor);
            $log?->setAlreadyConfirmed();
        }

        $this->em->flush();
    }
}
