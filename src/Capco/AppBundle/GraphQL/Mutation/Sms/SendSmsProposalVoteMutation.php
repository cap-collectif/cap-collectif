<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\AnonymousUserProposalSmsVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\UserPhoneErrors;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Validator\Constraints\CheckPhoneNumber;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SendSmsProposalVoteMutation implements MutationInterface
{
    public const INVALID_NUMBER = 'INVALID_NUMBER';
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';
    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';

    private const RETRY_PER_MINUTE = 2;

    private TwilioClient $twilioClient;
    private ValidatorInterface $validator;
    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository;

    public function __construct(
        TwilioClient $twilioClient,
        ValidatorInterface $validator,
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    ) {
        $this->twilioClient = $twilioClient;
        $this->validator = $validator;
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->anonymousUserProposalSmsVoteRepository = $anonymousUserProposalSmsVoteRepository;
    }

    public function __invoke(Argument $input): array
    {
        $phone = $input->offsetGet('phone');
        $stepId = $input->offsetGet('stepId');
        $proposalId = $input->offsetGet('proposalId');

        $proposal = $this->globalIdResolver->resolve($proposalId, null);
        $step = $this->globalIdResolver->resolve($stepId, null);

        $violations = $this->validator->validate($phone, new CheckPhoneNumber());
        /** * @var $violation ConstraintViolation  */
        foreach ($violations as $violation) {
            return ['errorCode' => $violation->getMessage()];
        }

        if (!$this->canRetry($phone, $step, $proposal)) {
            return ['errorCode' => self::RETRY_LIMIT_REACHED];
        }

        $response = $this->twilioClient->sendVerificationCode($phone);
        $statusCode = $response['statusCode'];

        $apiErrorCode = 400 === $statusCode ? $response['data']['code'] : null;

        if ($apiErrorCode === TwilioClient::ERRORS['LANDLINE_NUMBER_NOT_SUPPORTED']) {
            return ['errorCode' => UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER];
        }

        if ($apiErrorCode === TwilioClient::ERRORS['INVALID_PARAMETER']) {
            return ['errorCode' => self::INVALID_NUMBER];
        }

        if (201 === $statusCode) {
            $status = $response['data']['status'];
            $anonUserProposalSmsVote = (new AnonymousUserProposalSmsVote())
                ->setPhone($phone)
                ->setProposal($proposal)
                ->setCollectStep($step instanceof CollectStep ? $step : null)
                ->setSelectionStep($step instanceof SelectionStep ? $step : null)
                ->setStatus(strtoupper($status));
            $this->em->persist($anonUserProposalSmsVote);
            $this->em->flush();

            return ['errorCode' => null];
        }

        return ['errorCode' => self::TWILIO_API_ERROR];
    }

    public function canRetry(string $phone, AbstractStep $step, Proposal $proposal): bool
    {
        $smsVotesList = [];
        if ($step instanceof CollectStep) {
            $smsVotesList = $this->anonymousUserProposalSmsVoteRepository->findByPhoneAndCollectStepWithinOneMinuteRange($phone, $proposal, $step);
        } else if ($step instanceof SelectionStep) {
            $smsVotesList = $this->anonymousUserProposalSmsVoteRepository->findByPhoneAndSelectionStepWithinOneMinuteRange($phone, $proposal, $step);
        }
        return \count($smsVotesList) < self::RETRY_PER_MINUTE;
    }
}
