<?php
namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\IsPublishableInterface;
use Capco\AppBundle\Model\ModerableInterface;
use Capco\AppBundle\Traits\ExpirableTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="argument")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ArgumentRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Argument implements Contribution, VotableInterface, IsPublishableInterface, ModerableInterface
{
    use UuidTrait;
    use VotableOkTrait;
    use ExpirableTrait;
    use TextableTrait;
    use ModerableTrait;

    const TYPE_AGAINST = 0;
    const TYPE_FOR = 1;
    const TYPE_SIMPLE = 2;

    public static $argumentTypes = [
        self::TYPE_FOR => 'yes',
        self::TYPE_AGAINST => 'no',
        self::TYPE_SIMPLE => 'simple',
    ];

    public static $argumentTypesLabels = [
        self::TYPE_FOR => 'argument.show.type.for',
        self::TYPE_AGAINST => 'argument.show.type.against',
        self::TYPE_SIMPLE => 'argument.show.type.simple',
    ];

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @ORM\Column(name="type", type="integer")
     * @Assert\Choice(choices={0, 1})
     */
    private $type = 1;

    /**
     * @ORM\Column(name="is_trashed", type="boolean")
     */
    private $isTrashed = false;

    /**
     * @Gedmo\Timestampable(on="change", field={"isTrashed"})
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    private $trashedAt = null;

    /**
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="arguments")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Author;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="arguments", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $opinion;

    // ONE OF opinion or opinionVersion : should be in separate classes TODO
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionVersion", inversedBy="arguments", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_version_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $opinionVersion;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Argument", cascade={"persist", "remove"})
     */
    private $Reports;

    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->Reports = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getBodyExcerpt(50) : 'New argument';
    }

    public function getKind(): string
    {
        return 'argument';
    }

    public function getProject()
    {
        return $this->getParent()
            ->getStep()
            ->getProject();
    }

    public function getRelated()
    {
        return $this->getParent();
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $date): self
    {
        $this->updatedAt = $date;

        return $this;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->isEnabled = $enabled;

        return $this;
    }

    public function getType(): int
    {
        return $this->type;
    }

    public function getTypeAsString(): string
    {
        switch ($this->type) {
            case 0:
                return 'argument.show.type.against';
            case 1:
                return 'argument.show.type.for';
        }
    }

    public function setType(int $type)
    {
        $this->type = $type;
    }

    public function getIsTrashed(): bool
    {
        return $this->isTrashed;
    }

    public function isTrashed(): bool
    {
        return $this->isTrashed;
    }

    public function setIsTrashed(bool $isTrashed): self
    {
        $this->isTrashed = $isTrashed;

        return $this;
    }

    public function getTrashedAt(): ?\DateTime
    {
        return $this->trashedAt;
    }

    public function setTrashed(bool $trashed): self
    {
        $this->isTrashed = $trashed;

        return $this;
    }

    public function setTrashedAt(\DateTime $trashedAt = null): self
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    public function getTrashedReason(): ?string
    {
        return $this->trashedReason;
    }

    public function setTrashedReason(string $trashedReason = null): self
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }

    public function getAuthor()
    {
        return $this->Author;
    }

    public function setAuthor($Author)
    {
        $this->Author = $Author;

        return $this;
    }

    public function getStep()
    {
        return $this->getRelated()->getStep();
    }

    public function getOpinion()
    {
        return $this->opinion;
    }

    public function setOpinion($opinion): self
    {
        $this->opinion = $opinion;
        $opinion->addArgument($this);

        return $this;
    }

    public function getOpinionVersion()
    {
        return $this->opinionVersion;
    }

    public function setOpinionVersion($opinionVersion): self
    {
        $this->opinionVersion = $opinionVersion;
        $opinionVersion->addArgument($this);

        return $this;
    }

    public function getReports(): iterable
    {
        return $this->Reports;
    }

    public function addReport(Reporting $report): self
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report): self
    {
        $this->Reports->removeElement($report);

        return $this;
    }

    // ************************ Custom methods *********************************

    public function userHasReport(User $user = null): bool
    {
        if (null !== $user) {
            foreach ($this->Reports as $report) {
                if ($report->getReporter() === $user) {
                    return true;
                }
            }
        }

        return false;
    }

    public function canDisplay(): bool
    {
        return $this->getIsEnabled() && $this->getParent()->canDisplay();
    }

    public function canContribute(): bool
    {
        return $this->getIsEnabled() && !$this->isTrashed() && $this->getParent()->canContribute();
    }

    public function isPublished(): bool
    {
        return $this->getIsEnabled() && !$this->isTrashed() && $this->getParent()->isPublished();
    }

    public function canBeDeleted(): bool
    {
        return $this->getIsEnabled() && !$this->isTrashed() && $this->getParent()->canBeDeleted();
    }

    /**
     * @return OpinionVersion|Opinion
     */
    public function getParent()
    {
        if (null !== $this->opinionVersion) {
            return $this->opinionVersion;
        }

        return $this->opinion;
    }

    public function getLinkedOpinion()
    {
        if ($this->opinion) {
            return $this->opinion;
        }

        return $this->opinionVersion->getParent();
    }

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteArgument()
    {
        if (null !== $this->opinion) {
            $this->opinion->removeArgument($this);
        }

        if (null !== $this->opinionVersion) {
            $this->opinionVersion->removeArgument($this);
        }
    }

    public function isIndexable(): bool
    {
        return $this->getIsEnabled();
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'argument';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
