<?php

namespace Capco\AppBundle\Entity\Section;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\HomePageProjectsSectionConfigurationDisplayMode;
use Capco\AppBundle\Model\SonataTranslatableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\Map\ZoomTrait;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="section")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SectionRepository")
 */
class Section implements Translatable, SonataTranslatableInterface
{
    use SonataTranslatableTrait;
    use TranslatableTrait;
    use UuidTrait;
    use ZoomTrait;

    public static $fieldsForType = [
        'highlight' => [
            'title' => true,
            'teaser' => false,
            'body' => false,
            'nbObjects' => false,
        ],
        'introduction' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false,
        ],
        'videos' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'projects' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'themes' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'news' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'events' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'newsletter' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => false,
        ],
        'social-networks' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => false,
        ],
        'proposals' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'custom' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false,
        ],
        'metrics' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false,
        ],
    ];

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     */
    protected ?AbstractStep $step;

    /**
     * @ORM\Column(name="type", type="string", length=255)
     * @Assert\NotBlank()
     */
    private string $type = 'custom';

    /**
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     * @Assert\NotNull()
     */
    private int $position;

    /**
     * @ORM\Column(name="nb_objects", type="integer", nullable=true)
     */
    private ?int $nbObjects = null;

    /**
     * @ORM\Column(name="enabled", type="boolean", nullable=false, options={"default" = false})
     * @Assert\NotNull()
     */
    private bool $enabled = false;

    /**
     * @ORM\Column(name="metrics_to_display_basics", type="boolean", options={"default": false})
     */
    private bool $metricsToDisplayBasics = false;

    /**
     * @ORM\Column(name="metrics_to_display_events", type="boolean", options={"default": false})
     */
    private bool $metricsToDisplayEvents = false;

    /**
     * @ORM\Column(name="metrics_to_display_projects", type="boolean", options={"default": false})
     */
    private bool $metricsToDisplayProjects = false;

    /**
     * @ORM\Column(name="display_mode", type="string", options={"default":"MOST_RECENT"})
     * @Assert\Choice(choices = {"MOST_RECENT", "CUSTOM"})
     * Used when type = 'projects', set how the projects are displayed in the section
     */
    private string $displayMode = HomePageProjectsSectionConfigurationDisplayMode::MOST_RECENT;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private ?\DateTime $createdAt = null;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "position"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private ?\DateTime $updatedAt = null;

    /**
     * @ORM\Column(name="associated_features", type="simple_array", nullable=true)
     */
    private ?array $associatedFeatures;

    /**
     * @ORM\OneToMany(targetEntity=SectionProject::class, mappedBy="section", cascade="persist", orphanRemoval=true)
     */
    private Collection $sectionProjects;

    /**
     * @ORM\OneToMany(targetEntity=SectionCarrouselElement::class, mappedBy="section", cascade="persist", orphanRemoval=true)
     *
     * @var Collection<int, SectionCarrouselElement>
     */
    private Collection $sectionCarrouselElements;

    /**
     * @ORM\Column(name="center_latitude", type="float", nullable=true)
     */
    private ?float $centerLatitude;

    /**
     * @ORM\Column(name="center_longitude", type="float", nullable=true)
     */
    private ?float $centerLongitude;

    /**
     * @ORM\Column(name="is_legend_enabled_on_image", type="boolean")
     */
    private bool $isLegendEnabledOnImage = false;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->sectionProjects = new ArrayCollection();
        $this->sectionCarrouselElements = new ArrayCollection();
    }

    public function __toString()
    {
        $title = $this->getTitle() ?: '';

        return $this->getId() ? $title : 'New section';
    }

    public function getTitle(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitle();
    }

    public function setTitle(?string $title = null): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }

    public function getMetricsToDisplayBasics(): bool
    {
        return $this->metricsToDisplayBasics;
    }

    public function setMetricsToDisplayBasics(bool $metricsToDisplayBasics): self
    {
        $this->metricsToDisplayBasics = $metricsToDisplayBasics;

        return $this;
    }

    public function getMetricsToDisplayEvents(): bool
    {
        return $this->metricsToDisplayEvents;
    }

    public function setMetricsToDisplayEvents(bool $metricsToDisplayEvents): self
    {
        $this->metricsToDisplayEvents = $metricsToDisplayEvents;

        return $this;
    }

    public function getMetricsToDisplayProjects(): bool
    {
        return $this->metricsToDisplayProjects;
    }

    public function setMetricsToDisplayProjects(bool $metricsToDisplayProjects): self
    {
        $this->metricsToDisplayProjects = $metricsToDisplayProjects;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
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

    public function getTeaser(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTeaser();
    }

    public function setTeaser(?string $teaser = null): self
    {
        $this->translate(null, false)->setTeaser($teaser);

        return $this;
    }

    public function getBody(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBody();
    }

    public function setBody(?string $body = null): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
    }

    public function getNbObjects(): ?int
    {
        return $this->nbObjects;
    }

    public function setNbObjects(?int $nbObjects = null): self
    {
        $this->nbObjects = $nbObjects;

        return $this;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getAssociatedFeatures(): ?array
    {
        return $this->associatedFeatures;
    }

    public function setAssociatedFeatures(?array $associatedFeatures = null): self
    {
        $this->associatedFeatures = $associatedFeatures;

        return $this;
    }

    public function getStep(): ?AbstractStep
    {
        return $this->step;
    }

    public function setStep(?AbstractStep $step = null): self
    {
        $this->step = $step;

        return $this;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function setDisplayMode(string $displayMode): self
    {
        $this->displayMode = $displayMode;

        return $this;
    }

    public function getDisplayMode(): string
    {
        return $this->displayMode;
    }

    public function getCenterLatitude(): ?float
    {
        return $this->centerLatitude;
    }

    public function setCenterLatitude(?float $centerLatitude): self
    {
        $this->centerLatitude = $centerLatitude;

        return $this;
    }

    public function getCenterLongitude(): ?float
    {
        return $this->centerLongitude;
    }

    public function setCenterLongitude(?float $centerLongitude): self
    {
        $this->centerLongitude = $centerLongitude;

        return $this;
    }

    /**
     * @return Collection|SectionProject[]
     */
    public function getSectionProjects(): Collection
    {
        return $this->sectionProjects;
    }

    public function addSectionProject(SectionProject $sectionProject): self
    {
        if (!$this->sectionProjects->contains($sectionProject)) {
            $this->sectionProjects[] = $sectionProject;
            $sectionProject->setSection($this);
        }

        return $this;
    }

    public function removeSectionProject(SectionProject $sectionProject): self
    {
        if ($this->sectionProjects->removeElement($sectionProject)) {
            // set the owning side to null (unless already changed)
            if ($sectionProject->getSection() === $this) {
                $sectionProject->setSection(null);
            }
        }

        return $this;
    }

    /**
     *  @return Collection<int, SectionCarrouselElement>
     */
    public function getSectionCarrouselElements(): Collection
    {
        return $this->sectionCarrouselElements;
    }

    public function addSectionCarrouselElement(SectionCarrouselElement $sectionCarrouselElement): self
    {
        if (!$this->sectionProjects->contains($sectionCarrouselElement)) {
            $this->sectionCarrouselElements[] = $sectionCarrouselElement;
            $sectionCarrouselElement->setSection($this);
        }

        return $this;
    }

    public function removeSectionCarrouselElement(SectionCarrouselElement $sectionCarrouselElement): self
    {
        if ($this->sectionCarrouselElements->removeElement($sectionCarrouselElement)) {
            if ($sectionCarrouselElement->getSection() === $this) {
                $sectionCarrouselElement->setSection(null);
            }
        }

        return $this;
    }

    // ************************* Custom methods ***********************************

    public function isCustom()
    {
        return 'custom' === $this->type;
    }

    public static function getTranslationEntityClass(): string
    {
        return SectionTranslation::class;
    }

    public function isLegendEnabledOnImage(): bool
    {
        return $this->isLegendEnabledOnImage;
    }

    public function setIsLegendEnabledOnImage(bool $isLegendEnabledOnImage): self
    {
        $this->isLegendEnabledOnImage = $isLegendEnabledOnImage;

        return $this;
    }
}
