<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\MetaDescriptionTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\Text\DescriptionTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(
 *     name="consultation"
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationRepository")
 */
class Consultation implements EntityInterface, IndexableInterface, Ownerable, CreatableInterface, \Stringable
{
    use CreatableTrait;
    use CustomCodeTrait;
    use DescriptionTrait;
    use MetaDescriptionTrait;
    use OwnerableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="title", type="string", length=100)
     * @Assert\NotNull()
     */
    private string $title;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=true)
     * @ORM\Column(length=255)
     */
    private string $slug;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="illustration_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $illustration = null;

    /**
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private ?string $titleHelpText = null;

    /**
     * @ORM\Column(name="opinion_count_shown_by_section", type="integer")
     * @Assert\Range(max=20,min=1)
     */
    private int $opinionCountShownBySection = 10;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTime $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "opinionTypes"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \DateTime $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionType", mappedBy="consultation", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private Collection $opinionTypes;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStep", inversedBy="consultations", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?ConsultationStep $step = null;

    /**
     * @ORM\Column(name="description_help_text", type="string", length=255, nullable=true)
     */
    private ?string $descriptionHelpText = null;

    /**
     * @ORM\Column(name="moderating_on_create", type="boolean", nullable=false, options={"default" = false})
     */
    private bool $moderatingOnCreate = false;

    /**
     * @ORM\Column(name="moderating_on_update", type="boolean", nullable=false, options={"default" = false})
     */
    private bool $moderatingOnUpdate = false;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="consultation",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private Collection $opinions;

    /**
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     */
    private int $position = 1;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->opinionTypes = new ArrayCollection();
        $this->opinions = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->createdAt = new \DateTime();
            $this->updatedAt = new \DateTime();

            $originalOpinionTypes = $this->opinionTypes;
            $this->opinionTypes = new ArrayCollection();
            foreach ($originalOpinionTypes as $opinionType) {
                $clonedOpinionType = clone $opinionType;
                $this->addOpinionType($clonedOpinionType);
                $clonedOpinionType->setConsultation($this);
            }
        }
    }

    public function __toString(): string
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New consultation step type';
    }

    public function setPosition(int $position)
    {
        $this->position = $position;

        return $this;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    /**
     * @return Collection|Opinion[]
     */
    public function getOpinions(): Collection
    {
        return $this->opinions;
    }

    public function addOpinion(Opinion $opinion): self
    {
        if (!$this->opinions->contains($opinion)) {
            $this->opinions->add($opinion);
        }

        return $this;
    }

    public function removeOpinion(Opinion $opinion): self
    {
        if (!$this->opinions->contains($opinion)) {
            $this->opinions->removeElement($opinion);
        }

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    public function getIllustration(): ?Media
    {
        return $this->illustration;
    }

    public function setIllustration(?Media $illustration = null): self
    {
        $this->illustration = $illustration;

        return $this;
    }

    public function getOpinionCountShownBySection(): int
    {
        return $this->opinionCountShownBySection;
    }

    public function setOpinionCountShownBySection(int $opinionCountShownBySection): self
    {
        $this->opinionCountShownBySection = $opinionCountShownBySection;

        return $this;
    }

    // TODO: using step values before we definitely move those values in Consultation entity
    public function canContribute(?User $user): bool
    {
        return $this->getStep() ? $this->getStep()->canContribute($user) : false;
    }

    public function clearStep(): self
    {
        $this->step = null;

        return $this;
    }

    public function getStep(): ?ConsultationStep
    {
        return $this->step;
    }

    public function setStep(?ConsultationStep $step = null): self
    {
        $this->step = $step;

        return $this;
    }

    public function isModeratingOnCreate(): bool
    {
        return $this->moderatingOnCreate;
    }

    public function setModeratingOnCreate(bool $value): self
    {
        $this->moderatingOnCreate = $value;

        return $this;
    }

    public function isModeratingOnUpdate(): bool
    {
        return $this->moderatingOnUpdate;
    }

    public function setModeratingOnUpdate(bool $value): self
    {
        $this->moderatingOnUpdate = $value;

        return $this;
    }

    public function getTitleHelpText(): ?string
    {
        return $this->titleHelpText;
    }

    public function setTitleHelpText(?string $titleHelpText = null): self
    {
        $this->titleHelpText = $titleHelpText;

        return $this;
    }

    public function getDescriptionHelpText(): ?string
    {
        return $this->descriptionHelpText;
    }

    public function setDescriptionHelpText(?string $descriptionHelpText = null): self
    {
        $this->descriptionHelpText = $descriptionHelpText;

        return $this;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    public function setTitle($title): self
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return Collection|OpinionType[]
     */
    public function getOpinionTypes(): Collection
    {
        return $this->opinionTypes;
    }

    /**
     * @param $opinionTypes
     *
     * @return $this
     */
    public function setOpinionTypes($opinionTypes)
    {
        $this->opinionTypes = $opinionTypes;

        return $this;
    }

    /**
     * @param $opinionType
     *
     * @return $this
     */
    public function addOpinionType($opinionType)
    {
        if (!$this->opinionTypes->contains($opinionType)) {
            $this->opinionTypes[] = $opinionType;

            $opinionType->setConsultation($this);
        }

        return $this;
    }

    /**
     * @param $opinionType
     *
     * @return $this
     */
    public function removeOpinionType($opinionType)
    {
        $this->opinionTypes->removeElement($opinionType);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getRootOpinionTypes()
    {
        $roots = [];
        foreach ($this->opinionTypes as $opinionType) {
            if (!$opinionType->getParent()) {
                $roots[] = $opinionType;
            }
        }

        return $roots;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'consultation';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'Elasticsearch',
            'ElasticsearchOpinionNestedConsultation',
            'ElasticsearchVersionNestedConsultation',
            'ElasticsearchVoteNestedConsultation',
        ];
    }

    public static function getElasticsearchPriority(): int
    {
        return 15;
    }
}
