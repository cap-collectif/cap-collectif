<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="district")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DistrictRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class District implements IndexableInterface
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="districts")
     * @ORM\JoinColumn(name="form_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $form;

    /**
     * @ORM\Column(name="name", type="string", length=100)
     */
    private $name;

    /**
     * @ORM\Column(name="geojson", type="json", nullable=true)
     */
    private $geojson;

    /**
     * @ORM\Column(name="geojson_style", type="string", nullable=true)
     */
    private $geojsonStyle;

    /**
     * @ORM\Column(name="display_on_map", nullable=false, type="boolean")
     */
    private $displayedOnMap = true;

    /**
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Proposal",
     *  mappedBy="district"
     *  )
     */
    private $proposals;

    public function __construct()
    {
        $this->updatedAt = new \Datetime();
        $this->proposals = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getForm()
    {
        return $this->form;
    }

    public function setForm(ProposalForm $form): self
    {
        $this->form = $form;

        return $this;
    }

    public function getGeojson(): ?string
    {
        return $this->geojson;
    }

    public function setGeojson(string $geojson = null): self
    {
        $this->geojson = $geojson;

        return $this;
    }

    public function getGeojsonStyle(): ?string
    {
        return $this->geojsonStyle;
    }

    public function setGeojsonStyle(string $geojsonStyle = null): self
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

    public function getName()
    {
        return $this->name;
    }

    public function setName(string $name)
    {
        $this->name = $name;

        return $this;
    }

    public function getProposals()
    {
        return $this->proposals;
    }

    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }

    public function isIndexable(): bool
    {
        return true;
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
