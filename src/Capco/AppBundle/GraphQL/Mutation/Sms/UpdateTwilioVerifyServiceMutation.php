<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateTwilioVerifyServiceMutation implements MutationInterface
{
    use MutationTrait;

    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    private TwilioClient $twilioClient;
    private EntityManagerInterface $em;
    private ExternalServiceConfigurationRepository $externalServiceConfigurationRepository;

    public function __construct(
        TwilioClient $twilioClient,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository
    ) {
        $this->twilioClient = $twilioClient;
        $this->em = $em;
        $this->externalServiceConfigurationRepository = $externalServiceConfigurationRepository;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $serviceName = $input->offsetGet('serviceName');

        $response = $this->twilioClient->updateVerifyService($serviceName);

        if (200 === $response['statusCode']) {
            $updatedName = $response['data']['friendly_name'];

            $twilioServiceNameConfig = $this->externalServiceConfigurationRepository->findOneBy([
                'type' => ExternalServiceConfiguration::TWILIO_VERIFY_SERVICE_NAME,
            ]);
            $twilioServiceNameConfig->setValue($updatedName);

            $this->em->flush();

            return ['serviceName' => $updatedName, 'errorCode' => null];
        }

        return ['errorCode' => self::TWILIO_API_ERROR];
    }
}
