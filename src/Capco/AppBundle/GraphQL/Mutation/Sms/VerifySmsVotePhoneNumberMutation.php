<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class VerifySmsVotePhoneNumberMutation implements MutationInterface
{
    public const CODE_EXPIRED = 'CODE_EXPIRED';
    public const CODE_NOT_VALID = 'CODE_NOT_VALID';
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    private EntityManagerInterface $em;
    private TwilioClient $twilioClient;
    private AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository;
    private GlobalIdResolver $globalIdResolver;
    private TokenGenerator $tokenGenerator;
    private PhoneTokenRepository $phoneTokenRepository;

    public function __construct(
        EntityManagerInterface $em,
        TwilioClient $twilioClient,
        GlobalIdResolver $globalIdResolver,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        TokenGenerator $tokenGenerator,
        PhoneTokenRepository $phoneTokenRepository
    ) {
        $this->em = $em;
        $this->twilioClient = $twilioClient;
        $this->anonymousUserProposalSmsVoteRepository = $anonymousUserProposalSmsVoteRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->tokenGenerator = $tokenGenerator;
        $this->phoneTokenRepository = $phoneTokenRepository;
    }

    public function __invoke(Argument $input): array
    {
        $phone = $input->offsetGet('phone');
        $code = $input->offsetGet('code');
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');

        $proposal = $this->globalIdResolver->resolve($proposalId, null);
        $step = $this->globalIdResolver->resolve($stepId, null);

        $response = $this->twilioClient->checkVerificationCode($phone, $code);

        $statusCode = $response['statusCode'];

        // see https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
        $apiErrorCode = 404 === $statusCode ? $response['data']['code'] : null;
        if ($apiErrorCode === TwilioClient::ERRORS['NOT_FOUND']) {
            return ['errorCode' => self::CODE_EXPIRED];
        }

        if (200 === $statusCode) {
            $verificationStatus = $response['data']['status'];
            if ('pending' === $verificationStatus) {
                return ['errorCode' => self::CODE_NOT_VALID];
            }

            $anonUserProposalSmsVote = null;
            if ($step instanceof CollectStep) {
                $anonUserProposalSmsVote = $this->anonymousUserProposalSmsVoteRepository->findMostRecentSmsByCollectStep($phone, $proposal, $step);
            } else if ($step instanceof SelectionStep) {
                $anonUserProposalSmsVote = $this->anonymousUserProposalSmsVoteRepository->findMostRecentSmsBySelectionStep($phone, $proposal, $step);
            }

            $token = $this->generateToken($phone);
            if ($anonUserProposalSmsVote) {
                $anonUserProposalSmsVote->setStatus($verificationStatus);
                $this->em->flush();
            }

            return ['errorCode' => null, 'token' => $token];
        }

        return ['errorCode' => self::TWILIO_API_ERROR];
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
