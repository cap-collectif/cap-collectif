<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Client;
use Twilio\Rest\Messaging\V1\Service\AlphaSenderInstance;
use Twilio\Rest\Messaging\V1\ServiceInstance;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Twilio\Rest\Api\V2010\Account\MessageInstance;

class TwilioClient
{
    private const SENDER_NAME_MAX_LENGTH = 11;

    // see https://www.twilio.com/docs/api/errors
    public const ERRORS = [
        'INVALID_TO_NUMBER' => 21211
    ];


    private Client $client;
    private ExternalServiceConfigurationRepository $externalServiceConfigurationRepository;
    private ValidatorInterface $validator;

    public function __construct(ExternalServiceConfigurationRepository $externalServiceConfigurationRepository, ValidatorInterface $validator, string $twilioSid, string $twilioToken)
    {
        $this->client = new Client($twilioSid, $twilioToken);
        $this->externalServiceConfigurationRepository = $externalServiceConfigurationRepository;
        $this->validator = $validator;
    }

    public function send(string $to, string $body, string $messagingServiceSid): MessageInstance
    {
        return $this->client->messages->create($to, [
            'messagingServiceSid' => $messagingServiceSid,
            'body' => $body,
        ]);
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

        return $this->client->messaging->v1
            ->services($serviceId)
            ->alphaSenders->create($senderName);
    }

    /**
     * @throws TwilioException
     */
    public function deleteAlphaSender(string $alphaSenderSid): bool
    {
        $serviceId = $this->getServiceId();

        return $this->client->messaging->v1
            ->services($serviceId)
            ->alphaSenders($alphaSenderSid)
            ->delete();
    }

    public function getServiceId(): ?string
    {
        $config = $this->externalServiceConfigurationRepository->findOneBy([
            'type' => 'twilio_service_id',
        ]);

        return $config ? $config->getValue() : null;
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
