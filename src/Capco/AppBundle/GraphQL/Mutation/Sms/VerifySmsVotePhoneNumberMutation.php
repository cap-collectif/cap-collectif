<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class VerifySmsVotePhoneNumberMutation implements MutationInterface
{
    use MutationTrait;

    final public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';
    private readonly SmsProviderInterface $smsProvider;

    public function __construct(
        private readonly EntityManagerInterface $em,
        SmsProviderFetcher $smsProviderFactory,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        private readonly TokenGenerator $tokenGenerator,
        private readonly PhoneTokenRepository $phoneTokenRepository
    ) {
        $this->smsProvider = $smsProviderFactory->fetch();
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $phone = $input->offsetGet('phone');
        $code = $input->offsetGet('code');
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');

        $proposal = $this->globalIdResolver->resolve($proposalId, null);
        $step = $this->globalIdResolver->resolve($stepId, null);

        $verifyErrorCode = $this->smsProvider->verifySms($phone, $code);
        if ($verifyErrorCode) {
            return ['errorCode' => $verifyErrorCode];
        }

        $anonUserProposalSmsVote = null;
        if ($step instanceof CollectStep) {
            $anonUserProposalSmsVote = $this->anonymousUserProposalSmsVoteRepository->findMostRecentSmsByCollectStep(
                $phone,
                $proposal,
                $step
            );
        } elseif ($step instanceof SelectionStep) {
            $anonUserProposalSmsVote = $this->anonymousUserProposalSmsVoteRepository->findMostRecentSmsBySelectionStep(
                $phone,
                $proposal,
                $step
            );
        }

        $token = $this->generateToken($phone);
        if ($anonUserProposalSmsVote) {
            $anonUserProposalSmsVote->setApproved();
            $this->em->flush();
        }

        return ['errorCode' => null, 'token' => $token];
    }

    public function generateToken(string $phone): string
    {
        $token = $this->tokenGenerator->generateToken();
        $phoneToken = $this->phoneTokenRepository->findOneBy(['phone' => $phone]);

        if ($phoneToken) {
            $phoneToken->setToken($token);
        } else {
            $phoneToken = (new PhoneToken())->setPhone($phone)->setToken($token);
        }

        $this->em->persist($phoneToken);
        $this->em->flush();

        return $token;
    }
}
