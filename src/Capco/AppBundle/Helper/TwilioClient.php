<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Client;
use Twilio\Rest\Messaging\V1\Service\AlphaSenderInstance;
use Twilio\Rest\Messaging\V1\ServiceInstance;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class TwilioClient
{
    private const SENDER_NAME_MAX_LENGTH = 11;

    private Client $client;
    private ExternalServiceConfigurationRepository $externalServiceConfigurationRepository;
    private ValidatorInterface $validator;

    public function __construct(ExternalServiceConfigurationRepository $externalServiceConfigurationRepository, ValidatorInterface $validator, string $twilioSid, string $twilioToken)
    {
        $this->client = new Client($twilioSid, $twilioToken);
        $this->externalServiceConfigurationRepository = $externalServiceConfigurationRepository;
        $this->validator = $validator;
    }

    /**
     * @throws TwilioException
     */
    public function createService(string $serviceName): ServiceInstance
    {
        return $this->client->messaging->v1->services->create($serviceName);
    }

    /**
     * @throws TwilioException
     */
    public function createAlphaSender(string $senderName): AlphaSenderInstance
    {
        $serviceId = $this->getServiceId();
        return $this->client->messaging->v1->services($serviceId)->alphaSenders->create($senderName);
    }

    /**
     * @throws TwilioException
     */
    public function deleteAlphaSender(string $alphaSenderSid): bool
    {
        $serviceId = $this->getServiceId();
        return $this->client->messaging->v1->services($serviceId)
            ->alphaSenders($alphaSenderSid)
            ->delete();
    }

    public function getServiceId(): string
    {
        $config = $this->externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_service_id']);
        return $config->getValue();
    }

    /**
     * Twilio docs : https://www.twilio.com/docs/api/errors/21709
     * Alphanumeric Sender IDs may be up to 11 characters. Accepted characters include both upper- and lower-case ASCII letters, the digits 0 through 9, and space: A-Z, a-z, 0-9. They may not be only numbers.
     */
    public function isSenderNameValid(string $name): bool
    {
        $formatConstraint = new Assert\Regex(['pattern' => '/^[A-Za-z0-9]+$/']);
        $notOnlyNumberConstraint = new Assert\Regex(['pattern' => '/^[0-9]+$/', 'match' => false]);
        $lengthConstraint = new Assert\Length(['max' => self::SENDER_NAME_MAX_LENGTH]);

        $errors = $this->validator->validate($name, [
            $formatConstraint,
            $lengthConstraint,
            $notOnlyNumberConstraint
        ]);

        return $errors->count() === 0;
    }

}
