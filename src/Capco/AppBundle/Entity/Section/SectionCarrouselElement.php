<?php

namespace Capco\AppBundle\Entity\Section;

use Capco\AppBundle\Repository\SectionCarrouselElementRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="section_carrousel_element")
 * @ORM\Entity(repositoryClass=SectionCarrouselElementRepository::class)
 */
class SectionCarrouselElement
{
    use UuidTrait;

    private const TYPE_ARTICLE = 'article';
    private const TYPE_PROJECT = 'project';
    private const TYPE_EVENT = 'event';
    private const TYPE_THEME = 'theme';

    /**
     * @ORM\ManyToOne(targetEntity=Section::class, inversedBy="sectionCarrouselElements")
     * @ORM\JoinColumn(nullable=false)
     */
    private Section $section;

    /**
     * @ORM\Column(type="string")
     */
    private string $title;

    /**
     * @ORM\Column(type="integer")
     */
    private int $position;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private ?string $description = null;

    /**
     * @ORM\Column(type="string")
     */
    private string $buttonLabel;

    /**
     * @ORM\Column(type="string")
     * @Assert\Url()
     */
    private string $redirectLink;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $isDisplayed = false;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $image = null;

    /**
     * @ORM\Column(type="string")
     */
    private string $type;

    public function getSection(): Section
    {
        return $this->section;
    }

    public function setSection(Section $section): self
    {
        $this->section = $section;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): self
    {
        $this->position = $position;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getButtonLabel(): string
    {
        return $this->buttonLabel;
    }

    public function setButtonLabel(string $buttonLabel): self
    {
        $this->buttonLabel = $buttonLabel;

        return $this;
    }

    public function getRedirectLink(): string
    {
        return $this->redirectLink;
    }

    public function setRedirectLink(string $redirectLink): self
    {
        $this->redirectLink = $redirectLink;

        return $this;
    }

    public function isDisplayed(): bool
    {
        return $this->isDisplayed;
    }

    public function setIsDisplayed(bool $isDisplayed): self
    {
        $this->isDisplayed = $isDisplayed;

        return $this;
    }

    public function getImage(): Media
    {
        return $this->image;
    }

    public function setImage(Media $image): self
    {
        $this->image = $image;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        if (!\in_array($type, self::getAllowedTypes(), true)) {
            throw new \InvalidArgumentException("Invalid type for carousel item: {$type}");
        }
        $this->type = $type;

        return $this;
    }

    /**
     * @return array<int, string>
     */
    public static function getAllowedTypes(): array
    {
        return [
            self::TYPE_ARTICLE,
            self::TYPE_PROJECT,
            self::TYPE_EVENT,
            self::TYPE_THEME,
        ];
    }
}
