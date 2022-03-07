<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Helper\TwilioClient;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateTwilioVerifyServiceMutation implements MutationInterface
{
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    private TwilioClient $twilioClient;
    private EntityManagerInterface $em;

    public function __construct(TwilioClient $twilioClient, EntityManagerInterface $em)
    {
        $this->twilioClient = $twilioClient;
        $this->em = $em;
    }

    public function __invoke(Argument $input): array
    {
        $serviceName = $input->offsetGet('serviceName');

        $response = $this->twilioClient->createVerifyService($serviceName);
        $statusCode = $response['statusCode'];

        if (201 === $statusCode) {
            $service = $response['data'];
            $this->persistExternalServiceConfiguration(
                'twilio_verify_service_sid',
                $service['sid']
            );
            $this->persistExternalServiceConfiguration(
                'twilio_verify_service_name',
                $service['friendly_name']
            );

            return ['errorCode' => null, 'serviceName' => $serviceName];
        }

        return ['errorCode' => self::TWILIO_API_ERROR];
    }

    private function persistExternalServiceConfiguration(string $type, string $value)
    {
        $config = new ExternalServiceConfiguration();
        $config->setType($type);
        $config->setValue($value);
        $this->em->persist($config);
        $this->em->flush();
    }
}
