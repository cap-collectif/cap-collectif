<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="consultation")
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
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStep", inversedBy="consultation")
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
     * Constructor.
     */
    public function __construct()
    {
        $this->opinionTypes = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New consultation step type';
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
}
