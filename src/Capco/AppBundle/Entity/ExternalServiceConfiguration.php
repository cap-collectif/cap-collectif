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
    public const TYPES = [
        'mailer'
    ];
    public const AVAILABLE_VALUES = [
        'mailer' => [
            'mandrill',
            'mailjet'
        ]
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
        if (!in_array($type, self::TYPES)) {
            throw new \Exception('Invalid ExternalServiceConfiguration.type : '.$type);
        }
    }
}
