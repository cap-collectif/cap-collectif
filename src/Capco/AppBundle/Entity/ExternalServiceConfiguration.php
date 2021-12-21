<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="external_service_configuration")
 * @ORM\Entity(repositoryClass=ExternalServiceConfigurationRepository::class)
 */
class ExternalServiceConfiguration
{
    public const MAILER_MANDRILL = 'mandrill';
    public const MAILER_MAILJET = 'mailjet';
    public const TYPE_MAILER = 'mailer';

    public const TWILIO_SERVICE_ID = 'twilio_service_id';
    public const TWILIO_ALPHA_SENDER_ID = 'twilio_alpha_sender_id';
    public const TWILIO_ALPHA_SENDER_NAME = 'twilio_alpha_sender_name';

    public const TYPES = [
        self::TYPE_MAILER,
        self::TWILIO_SERVICE_ID,
        self::TWILIO_ALPHA_SENDER_ID,
        self::TWILIO_ALPHA_SENDER_NAME,
    ];
    public const AVAILABLE_VALUES = [
        self::TYPE_MAILER => [self::MAILER_MANDRILL, self::MAILER_MAILJET],
    ];

    /**
     * @ORM\Column(type="string", length=255)
     * @ORM\Id
     */
    private string $type;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $value;

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        self::checkType($type);
        $this->type = $type;

        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): self
    {
        $this->value = $value;

        return $this;
    }

    private static function checkType(string $type): void
    {
        if (!\in_array($type, self::TYPES)) {
            throw new \Exception('Invalid ExternalServiceConfiguration.type : ' . $type);
        }
    }
}
