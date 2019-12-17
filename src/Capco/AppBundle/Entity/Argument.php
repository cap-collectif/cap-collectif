<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Model\Publishable;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Model\ModerableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;

/**
 * @ORM\Table(name="argument", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ArgumentRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Argument implements Contribution, VotableInterface, Publishable, ModerableInterface
{
    use UuidTrait;
    use VotableOkTrait;
    use TextableTrait;
    use ModerableTrait;
    use PublishableTrait;
    use TrashableTrait;

    public const TYPE_AGAINST = 0;
    public const TYPE_FOR = 1;
    public const TYPE_SIMPLE = 2;

    public static $argumentTypes = [
        self::TYPE_FOR => 'yes',
        self::TYPE_AGAINST => 'no',
        self::TYPE_SIMPLE => 'simple'
    ];

    public static $argumentTypesLabels = [
        self::TYPE_FOR => 'argument.show.type.for',
        self::TYPE_AGAINST => 'argument.show.type.against',
        self::TYPE_SIMPLE => 'global.review'
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
     * @ORM\Column(name="type", type="integer")
     * @Assert\Choice(choices={0, 1})
     */
    private $type = 1;

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

    public function getProject(): ?Project
    {
        if ($this->getParent() && $this->getParent()->getStep()) {
            return $this->getParent()
                ->getStep()
                ->getProject();
        }

        return null;
    }

    public function getRelated()
    {
        return $this->getParent();
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    /** for the upgrade of alice fixture bundle */
    public function setCreatedAt(?\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
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

    public function setType($type)
    {
        $this->type = $type;
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

    public function getOpinion(): ?Opinion
    {
        return $this->opinion;
    }

    public function setOpinion($opinion): self
    {
        $this->opinion = $opinion;
        $opinion->addArgument($this);

        return $this;
    }

    public function getOpinionVersion(): ?OpinionVersion
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

    public function canDisplay($user = null): bool
    {
        return ($this->isPublished() && $this->getParent()->canDisplay($user)) ||
            ($user && $user->isAdmin());
    }

    public function canContribute($user = null): bool
    {
        return $this->isPublished() &&
            !$this->isTrashed() &&
            $this->getParent()->canContribute($user);
    }

    public function canBeDeleted($user = null): bool
    {
        return !$this->isTrashed() && $this->getParent()->canBeDeleted($user);
    }

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

    public function getConsultation(): ?Consultation
    {
        /** @var Opinion|OpinionVersion $related */
        $related = $this->getRelated();

        return $related ? $related->getConsultation() : null;
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
        return $this->isPublished() && $this->getProject() && $this->getProject()->isIndexable();
    }

    public static function getElasticsearchPriority(): int
    {
        return 9;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'argument';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchArgument',
            'ElasticsearchNestedAuthor',
            'ElasticsearchNestedStep',
            'ElasticsearchNestedProject',
            'ElasticsearchNestedArgument'
        ];
    }
}
