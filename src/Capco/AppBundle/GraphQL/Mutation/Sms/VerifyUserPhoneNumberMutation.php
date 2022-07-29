<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Helper\TwilioHelper;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class VerifyUserPhoneNumberMutation implements MutationInterface
{
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';

    private EntityManagerInterface $em;
    private TwilioHelper $twilioHelper;
    private UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository;

    public function __construct(
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository
    ) {
        $this->em = $em;
        $this->twilioHelper = $twilioHelper;
        $this->userPhoneVerificationSmsRepository = $userPhoneVerificationSmsRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        if ($viewer->isPhoneConfirmed()) {
            return ['errorCode' => self::PHONE_ALREADY_CONFIRMED];
        }

        $code = $input->offsetGet('code');
        $phone = $viewer->getPhone();
        $verifyErrorCode = $this->twilioHelper->verifySms($phone, $code);
        if ($verifyErrorCode) {
            return ['errorCode' => $verifyErrorCode];
        }

        $viewer->setPhoneConfirmed(true);
        $userPhoneVerif = $this->userPhoneVerificationSmsRepository->findMostRecentSms($viewer);
        $userPhoneVerif->setApproved();
        $this->em->flush();

        return ['errorCode' => null, 'user' => $viewer];
    }
}
