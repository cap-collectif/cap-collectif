<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\AnonymousUserProposalSmsVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\TwilioHelper;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Validator\Constraints\CheckPhoneNumber;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SendSmsProposalVoteMutation implements MutationInterface
{
    use MutationTrait;

    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';
    private const RETRY_PER_MINUTE = 2;

    private TwilioHelper $twilioHelper;
    private ValidatorInterface $validator;
    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository;

    public function __construct(
        TwilioHelper $twilioHelper,
        ValidatorInterface $validator,
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    ) {
        $this->twilioHelper = $twilioHelper;
        $this->validator = $validator;
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->anonymousUserProposalSmsVoteRepository = $anonymousUserProposalSmsVoteRepository;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $phone = $input->offsetGet('phone');
        $stepId = $input->offsetGet('stepId');
        $proposalId = $input->offsetGet('proposalId');

        $proposal = $this->globalIdResolver->resolve($proposalId, null);
        $step = $this->globalIdResolver->resolve($stepId, null);

        $violations = $this->validator->validate($phone, new CheckPhoneNumber());
        /** * @var ConstraintViolation $violation  */
        foreach ($violations as $violation) {
            return ['errorCode' => $violation->getMessage()];
        }

        if (!$this->canRetry($phone, $step, $proposal)) {
            return ['errorCode' => self::RETRY_LIMIT_REACHED];
        }

        $sendVerificationSmsErrorCode = $this->twilioHelper->sendVerificationSms($phone);
        if ($sendVerificationSmsErrorCode) {
            return ['errorCode' => $sendVerificationSmsErrorCode];
        }
        $anonUserProposalSmsVote = (new AnonymousUserProposalSmsVote())
            ->setPhone($phone)
            ->setProposal($proposal)
            ->setCollectStep($step instanceof CollectStep ? $step : null)
            ->setSelectionStep($step instanceof SelectionStep ? $step : null)
            ->setPending()
        ;

        $this->em->persist($anonUserProposalSmsVote);
        $this->em->flush();

        return ['errorCode' => null];
    }

    public function canRetry(string $phone, AbstractStep $step, Proposal $proposal): bool
    {
        $smsVotesList = [];
        if ($step instanceof CollectStep) {
            $smsVotesList = $this->anonymousUserProposalSmsVoteRepository->findByPhoneAndCollectStepWithinOneMinuteRange(
                $phone,
                $proposal,
                $step
            );
        } elseif ($step instanceof SelectionStep) {
            $smsVotesList = $this->anonymousUserProposalSmsVoteRepository->findByPhoneAndSelectionStepWithinOneMinuteRange(
                $phone,
                $proposal,
                $step
            );
        }

        return \count($smsVotesList) < self::RETRY_PER_MINUTE;
    }
}
