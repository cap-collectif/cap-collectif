<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Helper\TwilioClient;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Twilio\Exceptions\TwilioException;

class CreateTwilioSubAccount implements MutationInterface
{
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    private EntityManagerInterface $em;
    private TwilioClient $twilioClient;

    public function __construct(EntityManagerInterface $em, TwilioClient $twilioClient)
    {
        $this->em = $em;

        $this->twilioClient = $twilioClient;
    }

    public function __invoke(Argument $input): array
    {
        $name = $input->offsetGet('name');

        try {
            $subAccount = $this->twilioClient->createSubAccount($name);
            $sidConfig = (new ExternalServiceConfiguration())
                ->setType('twilio_subaccount_sid')
                ->setValue($subAccount->sid);
            $authTokenConfig = (new ExternalServiceConfiguration())
                ->setType('twilio_subaccount_auth_token')
                ->setValue($subAccount->authToken);

            $this->em->persist($sidConfig);
            $this->em->persist($authTokenConfig);
            $this->em->flush();
        } catch (TwilioException $e) {
            return ['errorCode' => self::TWILIO_API_ERROR];
        }

        return ['errorCode' => null];
    }
}
