<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\AnonymousUserProposalSmsVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\UserPhoneErrors;
use Capco\AppBundle\GraphQL\Mutation\Sms\SendSmsProposalVoteMutation;
use Capco\AppBundle\Helper\TwilioHelper;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Validator\Constraints\CheckPhoneNumber;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Prophecy\Argument;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;

class SendSmsProposalVoteMutationSpec extends ObjectBehavior
{
    public function let(
        TwilioHelper $twilioHelper,
        ValidatorInterface $validator,
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    ) {
        $this->beConstructedWith(
            $twilioHelper,
            $validator,
            $em,
            $globalIdResolver,
            $anonymousUserProposalSmsVoteRepository
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(SendSmsProposalVoteMutation::class);
    }

    public function it_should_send_sms(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ValidatorInterface $validator,
        TwilioHelper $twilioHelper,
        EntityManagerInterface $em,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    ) {
        $phone = '+33695868423';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($phone);
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId);
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal);
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step);

        $validator
            ->validate($phone, new CheckPhoneNumber())
            ->shouldBeCalledOnce()
            ->willReturn([]);
        $anonymousUserProposalSmsVoteRepository
            ->findByPhoneAndCollectStepWithinOneMinuteRange($phone, $proposal, $step)
            ->shouldBeCalledOnce()
            ->willReturn([]);

        $twilioHelper
            ->sendVerificationSms($phone)
            ->shouldBeCalledOnce()
            ->willReturn(null);

        $em->persist(Argument::type(AnonymousUserProposalSmsVote::class));
        $em->flush();

        $this->__invoke($input)->shouldReturn([
            'errorCode' => null,
        ]);
    }

    public function it_should_return_PHONE_ALREADY_USED_BY_ANOTHER_USER_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ValidatorInterface $validator,
        ConstraintViolation $violation
    ) {
        $phone = '+33675492871';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($phone);
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId);
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal);
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step);

        $violation
            ->getMessage()
            ->shouldBeCalledOnce()
            ->willReturn('PHONE_ALREADY_USED_BY_ANOTHER_USER');

        $violationList = new ConstraintViolationList([$violation->getWrappedObject()]);
        $validator
            ->validate($phone, Argument::type(CheckPhoneNumber::class))
            ->shouldBeCalledOnce()
            ->willReturn($violationList);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => 'PHONE_ALREADY_USED_BY_ANOTHER_USER',
        ]);
    }

    public function it_should_return_INVALID_LENGTH_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ValidatorInterface $validator,
        ConstraintViolation $violation
    ) {
        $phone = '+331332';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($phone);
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId);
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal);
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step);

        $violation
            ->getMessage()
            ->shouldBeCalledOnce()
            ->willReturn('INVALID_LENGTH');

        $violationList = new ConstraintViolationList([$violation->getWrappedObject()]);
        $validator
            ->validate($phone, Argument::type(CheckPhoneNumber::class))
            ->shouldBeCalledOnce()
            ->willReturn($violationList);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => 'INVALID_LENGTH',
        ]);
    }

    public function it_should_return_RETRY_LIMIT_REACHED_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ValidatorInterface $validator,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        AnonymousUserProposalSmsVote $anonymousUserProposalSmsVote1,
        AnonymousUserProposalSmsVote $anonymousUserProposalSmsVote2
    ) {
        $phone = '+33695868423';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($phone);
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId);
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal);
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step);

        $validator
            ->validate($phone, new CheckPhoneNumber())
            ->shouldBeCalledOnce()
            ->willReturn([]);
        $anonymousUserProposalSmsVoteRepository
            ->findByPhoneAndCollectStepWithinOneMinuteRange($phone, $proposal, $step)
            ->shouldBeCalledOnce()
            ->willReturn([$anonymousUserProposalSmsVote1, $anonymousUserProposalSmsVote2]);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => 'RETRY_LIMIT_REACHED',
        ]);
    }

    public function it_should_return_PHONE_SHOULD_BE_MOBILE_NUMBER_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ValidatorInterface $validator,
        TwilioHelper $twilioHelper,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    ) {
        $phone = '+33695868423';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($phone);
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId);
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal);
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step);

        $validator
            ->validate($phone, new CheckPhoneNumber())
            ->shouldBeCalledOnce()
            ->willReturn([]);
        $anonymousUserProposalSmsVoteRepository
            ->findByPhoneAndCollectStepWithinOneMinuteRange($phone, $proposal, $step)
            ->shouldBeCalledOnce()
            ->willReturn([]);

        $twilioHelper
            ->sendVerificationSms($phone)
            ->shouldBeCalledOnce()
            ->willReturn(UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER,
        ]);
    }

    public function it_should_return_INVALID_NUMBER_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ValidatorInterface $validator,
        TwilioHelper $twilioHelper,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    ) {
        $phone = '+33695868423';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($phone);
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId);
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal);
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step);

        $validator
            ->validate($phone, new CheckPhoneNumber())
            ->shouldBeCalledOnce()
            ->willReturn([]);
        $anonymousUserProposalSmsVoteRepository
            ->findByPhoneAndCollectStepWithinOneMinuteRange($phone, $proposal, $step)
            ->shouldBeCalledOnce()
            ->willReturn([]);

        $twilioHelper
            ->sendVerificationSms($phone)
            ->shouldBeCalledOnce()
            ->willReturn(TwilioHelper::INVALID_NUMBER);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioHelper::INVALID_NUMBER,
        ]);
    }
}
