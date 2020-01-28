<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\FontRepository")
 * @ORM\Table(name="font")
 */
class Font
{
    use UuidTrait;
    use TimestampableTrait;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $weight;

    /**
     * Does the font is a custom one uploaded by an user.
     *
     * @ORM\Column(name="is_custom", type="boolean", nullable=false, options={"default" = true})
     */
    private $isCustom = true;

    /**
     * @ORM\Column(name="use_as_heading", type="boolean")
     */
    private $useAsHeading = false;

    /**
     * @ORM\Column(name="use_as_body", type="boolean")
     */
    private $useAsBody = false;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $format;

    /**
     * @ORM\Column(name="family_name", type="string", length=255)
     */
    private $familyName;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $style;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $fullname;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"remove"})
     * @ORM\JoinColumn(nullable=true)
     */
    private $file;

    public static function fromUploadedFont(array $font)
    {
        $instance = new self();

        $instance
            ->setFamilyName($font['name'])
            ->setFormat($font['format'])
            ->setWeight($font['weight'])
            ->setName($font['name'])
            ->setStyle($font['style'])
            ->setFullname($font['fullname']);

        return $instance;
    }

    public function getWeight(): ?int
    {
        return $this->weight;
    }

    public function setWeight(?int $weight): self
    {
        $this->weight = $weight;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getFamilyName(): ?string
    {
        return $this->familyName;
    }

    public function setFamilyName(string $familyName): self
    {
        $this->familyName = $familyName;

        return $this;
    }

    public function getStyle(): ?string
    {
        return $this->style;
    }

    public function setStyle(?string $style): self
    {
        $this->style = $style;

        return $this;
    }

    public function getFullname(): ?string
    {
        return $this->fullname;
    }

    public function setFullname(?string $fullname): self
    {
        $this->fullname = $fullname;

        return $this;
    }

    public function getFile(): ?Media
    {
        return $this->file;
    }

    public function setFile(?Media $file): self
    {
        $this->file = $file;

        return $this;
    }

    public function isCustom(): bool
    {
        return $this->isCustom;
    }

    public function setIsCustom(bool $isCustom): void
    {
        $this->isCustom = $isCustom;
    }

    public function getUseAsHeading(): ?bool
    {
        return $this->useAsHeading;
    }

    public function setUseAsHeading(bool $value): self
    {
        $this->useAsHeading = $value;

        return $this;
    }

    public function getUseAsBody(): ?bool
    {
        return $this->useAsBody;
    }

    public function setUseAsBody(bool $value): self
    {
        $this->useAsBody = $value;

        return $this;
    }

    public function getFormat(): ?string
    {
        return $this->format;
    }

    public function setFormat(?string $format): self
    {
        $this->format = $format;

        return $this;
    }
}
