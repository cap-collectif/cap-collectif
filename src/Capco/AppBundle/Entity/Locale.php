<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="locale")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\LocaleRepository")
 */
class Locale
{
    use UuidTrait;

    /**
     * @ORM\Column(name="traduction_key", unique=true, length=255)
     */
    private $traductionKey;

    /**
     * @ORM\Column(name="code", type="string", unique=true, length=8)
     */
    private $code;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $enabled = false;

    /**
     * @ORM\Column(name="is_published", type="boolean")
     */
    private $published = false;

    /**
     * @ORM\Column(name="is_default", type="boolean")
     */
    private $default = false;

    public function __construct(string $code, string $traductionKey)
    {
        $this->setCode($code)->setTraductionKey($traductionKey);
    }

    public function __toString()
    {
        return $this->code;
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getTraductionKey(): string
    {
        return $this->traductionKey;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function enable(): self
    {
        $this->enabled = true;

        return $this;
    }

    public function disable(): self
    {
        if ($this->isPublished()) {
            throw new LocaleConfigurationException(
                $this->getCode() . ' : ' . LocaleConfigurationException::MESSAGE_DISABLE_PUBLISHED
            );
        }
        $this->enabled = false;

        return $this;
    }

    public function isPublished(): bool
    {
        return $this->published;
    }

    public function publish(): self
    {
        if (!$this->isEnabled()) {
            throw new LocaleConfigurationException(
                $this->getCode() . ' : ' . LocaleConfigurationException::MESSAGE_PUBLISH_DISABLED
            );
        }
        $this->published = true;

        return $this;
    }

    public function unpublish(): self
    {
        $this->published = false;

        return $this;
    }

    public function isDefault(): bool
    {
        return $this->default;
    }

    public function setDefault(): self
    {
        if (!$this->isPublished()) {
            throw new LocaleConfigurationException(
                $this->getCode() . ' : ' . LocaleConfigurationException::MESSAGE_DEFAULT_UNPUBLISHED
            );
        }
        $this->default = true;

        return $this;
    }

    public function unsetDefault(): self
    {
        $this->default = false;

        return $this;
    }

    private function setCode(string $code): self
    {
        $this->code = $code;

        return $this;
    }

    private function setTraductionKey(string $traductionKey): self
    {
        $this->traductionKey = $traductionKey;

        return $this;
    }
}
