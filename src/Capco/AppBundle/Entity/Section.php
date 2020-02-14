<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Model\SonataTranslatableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="section")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SectionRepository")
 */
class Section implements Translatable, SonataTranslatableInterface
{
    use UuidTrait;
    use SonataTranslatableTrait;
    use TranslatableTrait;

    public static $fieldsForType = [
        'highlight' => [
            'title' => true,
            'teaser' => false,
            'body' => false,
            'nbObjects' => false
        ],
        'introduction' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false
        ],
        'videos' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true
        ],
        'projects' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true
        ],
        'themes' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true
        ],
        'news' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true
        ],
        'events' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true
        ],
        'newsletter' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => false
        ],
        'social-networks' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => false
        ],
        'proposals' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true
        ],
        'custom' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false
        ],
        'metrics' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false
        ]
    ];

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     */
    protected $step;

    /**
     * @ORM\Column(name="type", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $type = 'custom';

    /**
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     * @Assert\NotNull()
     */
    private $position;

    /**
     * @ORM\Column(name="nb_objects", type="integer", nullable=true)
     */
    private $nbObjects;

    /**
     * @ORM\Column(name="enabled", type="boolean")
     * @Assert\NotNull()
     */
    private $enabled;

    /**
     * @ORM\Column(name="metrics_to_display_basics", type="boolean")
     */
    private $metricsToDisplayBasics = false;

    /**
     * @ORM\Column(name="metrics_to_display_events", type="boolean")
     */
    private $metricsToDisplayEvents = false;

    /**
     * @ORM\Column(name="metrics_to_display_projects", type="boolean")
     */
    private $metricsToDisplayProjects = false;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "position"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="associated_features", type="simple_array", nullable=true)
     */
    private $associatedFeatures;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
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

    public function setTitle(string $title): self
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

    public function setTeaser(string $teaser): self
    {
        $this->translate(null, false)->setTeaser($teaser);

        return $this;
    }

    public function getBody(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBody();
    }

    public function setBody(string $body): self
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

    public function isEnabled(): ?bool
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

    // ************************* Custom methods ***********************************

    public function isCustom()
    {
        return 'custom' === $this->type;
    }

    public static function getTranslationEntityClass(): string
    {
        return SectionTranslation::class;
    }
}
