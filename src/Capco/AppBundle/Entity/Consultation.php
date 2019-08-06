<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(
 *     name="consultation",
 *     uniqueConstraints={
 *     @ORM\UniqueConstraint(
 *        name="consultation_position_unique",
 *        columns={"step_id", "position"}
 *     )
 *   }
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationRepository")
 */
class Consultation
{
    use UuidTrait;
    use MetaDescriptionCustomCodeTrait;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=100)
     * @Assert\NotNull()
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=true)
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="illustration_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $illustration;

    /**
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private $titleHelpText;

    /**
     * @ORM\Column(name="opinion_count_shown_by_section", type="integer")
     * @Assert\Range(max=20,min=1)
     */
    private $opinionCountShownBySection = 5;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "opinionTypes"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionType", mappedBy="consultation", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $opinionTypes;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStep", inversedBy="consultations")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $step;

    /**
     * @ORM\Column(name="description_help_text", type="string", length=255, nullable=true)
     */
    private $descriptionHelpText;

    /**
     * @ORM\Column(name="moderating_on_create", type="boolean", nullable=false, options={"default" = false})
     */
    private $moderatingOnCreate = false;

    /**
     * @ORM\Column(name="moderating_on_update", type="boolean", nullable=false, options={"default" = false})
     */
    private $moderatingOnUpdate = false;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="consultation",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $opinions;

    /**
     * @ORM\Column(name="opinion_count", type="integer")
     */
    private $opinionCount = 0;

    /**
     * @ORM\Column(name="trashed_opinion_count", type="integer")
     */
    private $trashedOpinionCount = 0;

    /**
     * @ORM\Column(name="opinion_versions_count", type="integer")
     */
    private $opinionVersionsCount = 0;

    /**
     * @ORM\Column(name="trashed_opinion_versions_count", type="integer")
     */
    private $trashedOpinionVersionsCount = 0;

    /**
     * @ORM\Column(name="argument_count", type="integer")
     */
    private $argumentCount = 0;

    /**
     * @ORM\Column(name="trashed_argument_count", type="integer")
     */
    private $trashedArgumentCount = 0;

    /**
     * @ORM\Column(name="sources_count", type="integer")
     */
    private $sourcesCount = 0;

    /**
     * @ORM\Column(name="trashed_sources_count", type="integer")
     */
    private $trashedSourceCount = 0;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @ORM\Column(name="contributors_count", type="integer")
     */
    private $contributorsCount = 0;

    /**
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     */
    private $position = 1;

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
     * Constructor.
     */
    public function __construct()
    {
        $this->opinionTypes = new ArrayCollection();
        $this->opinions = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New consultation step type';
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description = null): self
    {
        $this->description = $description;

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
        return $this->getStep()->canContribute($user);
    }

    // TODO: using step values before we definitely move those values in Consultation entity
    public function getVotesCount(): int
    {
        return $this->getStep()->getVotesCount();
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

    public function setStep(ConsultationStep $step = null): self
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

    public function getOpinionCount(): int
    {
        return $this->opinionCount;
    }

    public function setOpinionCount(int $opinionCount): self
    {
        $this->opinionCount = $opinionCount;

        return $this;
    }

    public function getTrashedOpinionCount(): int
    {
        return $this->trashedOpinionCount;
    }

    public function setTrashedOpinionCount(int $trashedOpinionCount): self
    {
        $this->trashedOpinionCount = $trashedOpinionCount;

        return $this;
    }

    public function getOpinionVersionsCount(): int
    {
        return $this->opinionVersionsCount;
    }

    public function setOpinionVersionsCount(int $opinionVersionsCount): self
    {
        $this->opinionVersionsCount = $opinionVersionsCount;
    }

    public function getTrashedOpinionVersionsCount(): int
    {
        return $this->trashedOpinionVersionsCount;
    }

    public function setTrashedOpinionVersionsCount(int $trashedOpinionVersionsCount): self
    {
        $this->trashedOpinionVersionsCount = $trashedOpinionVersionsCount;

        return $this;
    }

    public function getArgumentCount(): int
    {
        return $this->argumentCount;
    }

    public function setArgumentCount(int $argumentCount): self
    {
        $this->argumentCount = $argumentCount;

        return $this;
    }

    public function getTrashedArgumentCount(): int
    {
        return $this->trashedArgumentCount;
    }

    public function setTrashedArgumentCount(int $trashedArgumentCount): self
    {
        $this->trashedArgumentCount = $trashedArgumentCount;

        return $this;
    }

    public function getSourcesCount(): int
    {
        return $this->sourcesCount;
    }

    public function setSourcesCount(int $sourcesCount): self
    {
        $this->sourcesCount = $sourcesCount;

        return $this;
    }

    public function getTrashedSourceCount(): int
    {
        return $this->trashedSourceCount;
    }

    public function setTrashedSourceCount(int $trashedSourceCount): self
    {
        $this->trashedSourceCount = $trashedSourceCount;

        return $this;
    }

    public function setVotesCount(int $votesCount): self
    {
        $this->votesCount = $votesCount;

        return $this;
    }

    public function getContributorsCount(): int
    {
        return $this->contributorsCount;
    }

    public function setContributorsCount(int $contributorsCount): self
    {
        $this->contributorsCount = $contributorsCount;

        return $this;
    }

    public function getContributionsCount(): int
    {
        return $this->opinionCount +
            $this->trashedOpinionCount +
            $this->argumentCount +
            $this->trashedArgumentCount +
            $this->opinionVersionsCount +
            $this->trashedOpinionVersionsCount +
            $this->sourcesCount +
            $this->trashedSourceCount;
    }
}
