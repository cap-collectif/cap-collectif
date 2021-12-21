<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Helper\TwilioClient;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Twilio\Exceptions\TwilioException;

class CreateTwilioServiceMutation implements MutationInterface
{
    public const COULD_NOT_CREATE_SERVICE = 'COULD_NOT_CREATE_SERVICE';
    public const INVALID_SENDER_NAME = 'INVALID_SENDER_NAME';

    private TwilioClient $twilioClient;
    private EntityManagerInterface $em;

    public function __construct(
        TwilioClient $twilioClient,
        EntityManagerInterface $em
    ) {
        $this->twilioClient = $twilioClient;
        $this->em = $em;
    }

    public function __invoke(Argument $input): array
    {
        $serviceName = $input->offsetGet('serviceName');
        if (!$this->twilioClient->isSenderNameValid($serviceName)) {
            return ['errorCode' => self::INVALID_SENDER_NAME];
        }
        try {
            $service = $this->twilioClient->createService($serviceName);
            $this->persistExternalServiceConfiguration('twilio_service_id', $service->sid);
            $sender = $this->twilioClient->createAlphaSender($serviceName);
            $this->persistExternalServiceConfiguration('twilio_alpha_sender_id', $sender->sid);
            $this->persistExternalServiceConfiguration('twilio_alpha_sender_name', $sender->alphaSender);
        } catch (TwilioException $e) {
            return ['errorCode' => self::COULD_NOT_CREATE_SERVICE];
        }
        return ['errorCode' => null, 'serviceName' => $serviceName];
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
