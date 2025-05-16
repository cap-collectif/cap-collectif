<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Styles\BackgroundStyle;
use Capco\AppBundle\Entity\Styles\BorderStyle;
use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="district")
 * @ORM\Entity
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "district_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "proposal"        = "ProposalDistrict",
 *      "global"         = "GlobalDistrict"
 * })
 */
abstract class AbstractDistrict implements EntityInterface, IndexableInterface, TranslatableInterface
{
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="geojson", type="json", nullable=true)
     */
    private ?string $geojson = null;

    /**
     * @ORM\Column(name="geojson_style", type="string", nullable=true)
     */
    private ?string $geojsonStyle = null;

    /**
     * @ORM\Column(name="display_on_map", nullable=false, type="boolean", options={"default": true})
     */
    private bool $displayedOnMap = true;

    /**
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Styles\BorderStyle", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="border_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?BorderStyle $border = null;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Styles\BackgroundStyle", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="background_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?BackgroundStyle $background = null;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function getGeojson(): ?string
    {
        return $this->geojson;
    }

    public function setGeojson(?string $geojson = null): self
    {
        $this->geojson = $geojson;

        return $this;
    }

    public function getGeojsonStyle(): ?string
    {
        return $this->geojsonStyle;
    }

    public function setGeojsonStyle(?string $geojsonStyle = null): self
    {
        $this->geojsonStyle = $geojsonStyle;

        return $this;
    }

    public function setDisplayedOnMap(bool $displayedOnMap): self
    {
        $this->displayedOnMap = $displayedOnMap;

        return $this;
    }

    public function isDisplayedOnMap(): bool
    {
        return $this->displayedOnMap;
    }

    public function getName(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getName();
    }

    public function getTitleOnMap(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitleOnMap();
    }

    public function setName(?string $name = null): self
    {
        $this->translate(null, false)->setName($name);

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return DistrictTranslation::class;
    }

    public function getBorder(): ?BorderStyle
    {
        return $this->border;
    }

    public function setBorder(?BorderStyle $border): self
    {
        $this->border = $border;

        return $this;
    }

    public function getBackground(): ?BackgroundStyle
    {
        return $this->background;
    }

    public function setBackground(?BackgroundStyle $background): self
    {
        $this->background = $background;

        return $this;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 6;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'district';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
