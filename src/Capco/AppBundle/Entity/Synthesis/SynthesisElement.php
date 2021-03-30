<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * SynthesisElement.
 *
 * @ORM\Table(name="synthesis_element")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Synthesis\SynthesisElementRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Gedmo\Loggable()
 * @Gedmo\Tree(type="materializedPath")
 */
class SynthesisElement
{
    use UuidTrait;

    /**
     * @ORM\Column(name="published", type="boolean", options={"default": false})
     * @Gedmo\Versioned
     */
    private $published = false;

    /**
     * @var \DateTime
     * @ORM\Column(name="created_at", type="datetime")
     * @Gedmo\Timestampable(on="create")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body", "archived", "published", "parent", "notation"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var \DateTime
     * @Gedmo\Versioned
     * @ORM\Column(name="deleted_at", type="datetime", nullable=true)
     */
    private $deletedAt;

    /**
     * @ORM\Column(name="archived", type="boolean", options={"default": false})
     * @Gedmo\Versioned
     */
    private $archived = false;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\Synthesis", inversedBy="elements", cascade={"persist"})
     * @ORM\JoinColumn(name="synthesis_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $synthesis;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisUserInterface")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $author;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisDivision", inversedBy="elements", cascade={"persist"})
     * @ORM\JoinColumn(name="original_division_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Gedmo\Versioned
     */
    private $originalDivision;

    /**
     * @var
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisDivision", inversedBy="originalElement", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="division_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Gedmo\Versioned
     */
    private $division;

    /**
     * @Gedmo\TreeLevel
     * @ORM\Column(name="level", type="integer", nullable=true)
     */
    private $level;

    /**
     * @Gedmo\TreePath(appendId=true, startsWithSeparator=false, endsWithSeparator=false, separator="|")
     * @ORM\Column(name="path", type="string", length=3000, nullable=true)
     */
    private $path;

    /**
     * @var
     * @Gedmo\TreeParent
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", inversedBy="children", cascade={"persist"})
     * @Gedmo\Versioned
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $parent;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="parent", cascade={"persist"})
     * @ORM\OrderBy({"createdAt" = "ASC"})
     */
    private $children;

    /**
     * @var string
     * @ORM\Column(name="display_type", type="string", length=255, nullable=false)
     * @Assert\Choice(choices={"folder", "contribution", "source", "grouping"})
     */
    private $displayType;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     * @Gedmo\TreePathSource
     * @Gedmo\Versioned
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="subtitle", type="string", length=255, nullable=true)
     * @Gedmo\Versioned
     */
    private $subtitle;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text", nullable=true)
     * @Gedmo\Versioned
     */
    private $body;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     * @Gedmo\Versioned
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(name="link", type="text", nullable=true)
     * @Gedmo\Versioned
     * @Assert\Url()
     */
    private $link;

    /**
     * @var int
     *
     * @ORM\Column(name="notation", type="integer", nullable=true)
     * @Gedmo\Versioned
     */
    private $notation;

    /**
     * @var string
     *
     * @ORM\Column(name="comment", type="text", nullable=true)
     * @Gedmo\Versioned
     */
    private $comment;

    /**
     * @ORM\Column(name="votes", type="array", nullable=true)
     * @Gedmo\Versioned
     */
    private $votes;

    /**
     * @var int
     *
     * @ORM\Column(name="published_children_count", type="integer")
     * @Gedmo\Versioned
     */
    private $publishedChildrenCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="published_parent_children_count", type="integer")
     * @Gedmo\Versioned
     */
    private $publishedParentChildrenCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="children_score", type="integer")
     * @Gedmo\Versioned
     */
    private $childrenScore = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="parent_children_score", type="integer")
     * @Gedmo\Versioned
     */
    private $parentChildrenScore = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_class", type="string", length=255, nullable=true)
     */
    private $linkedDataClass;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_id", type="string", length=255, nullable=true)
     */
    private $linkedDataId;

    /**
     * @ORM\Column(name="linked_data_last_update", type="datetime", nullable=true)
     */
    private $linkedDataLastUpdate;

    /**
     * @var \DateTime
     * @ORM\Column(name="linked_data_creation", type="datetime", nullable=true)
     */
    private $linkedDataCreation;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_url", type="text", nullable=true)
     */
    private $linkedDataUrl;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->votes = [];
        $this->children = new ArrayCollection();
        $this->displayType = 'folder';
    }

    /**
     * @return mixed
     */
    public function getSynthesis()
    {
        return $this->synthesis;
    }

    public function setSynthesis(Synthesis $synthesis)
    {
        $this->synthesis = $synthesis;
    }

    /**
     * @return mixed
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param mixed $author
     */
    public function setAuthor($author)
    {
        $this->author = $author;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param \DateTime $createdAt
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param \DateTime $updatedAt
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
    }

    /**
     * @return null|\DateTime
     */
    public function getDeletedAt()
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTime $deletedAt = null): self
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getOriginalDivision()
    {
        return $this->originalDivision;
    }

    /**
     * @param mixed $originalDivision
     */
    public function setOriginalDivision(SynthesisDivision $originalDivision)
    {
        $this->originalDivision = $originalDivision;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getDivision()
    {
        return $this->division;
    }

    /**
     * @param mixed $division
     */
    public function setDivision(SynthesisDivision $division)
    {
        $this->division = $division;
        $division->setOriginalElement($this);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @param mixed $parent
     */
    public function setParent($parent)
    {
        $this->parent = $parent;
    }

    /**
     * @return mixed
     */
    public function getChildren()
    {
        return $this->children;
    }

    public function addChild($child)
    {
        if ($child && !$this->children->contains($child)) {
            $this->children[] = $child;
            $child->setParent($this);
        }

        return $this;
    }

    public function removeChild($child)
    {
        if ($child) {
            $this->children->remove($child);
            $child->setParent(null);
        }

        return $this;
    }

    /**
     * @return mixed
     */
    public function getDisplayType()
    {
        return $this->displayType;
    }

    /**
     * @param mixed $displayType
     */
    public function setDisplayType($displayType)
    {
        $this->displayType = $displayType;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    public function setTitle(string $title)
    {
        // QuickFix: | is used as a separator so we can not use it
        $this->title = str_replace('|', '', $title);

        return $this;
    }

    /**
     * @return string
     */
    public function getSubtitle()
    {
        return $this->subtitle;
    }

    /**
     * @param string $subtitle
     */
    public function setSubtitle($subtitle)
    {
        $this->subtitle = $subtitle;

        return $this;
    }

    /**
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param string $body
     */
    public function setBody($body)
    {
        $this->body = $body;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * @param string $link
     */
    public function setLink($link)
    {
        $this->link = $link;
    }

    /**
     * @return mixed
     */
    public function isPublished()
    {
        return $this->published;
    }

    /**
     * @param mixed $published
     */
    public function setPublished($published)
    {
        $this->published = $published;
    }

    /**
     * @return mixed
     */
    public function isArchived()
    {
        return $this->archived;
    }

    /**
     * @param mixed $archived
     */
    public function setArchived($archived)
    {
        $this->archived = $archived;
    }

    /**
     * @return int
     */
    public function getNotation()
    {
        return $this->notation;
    }

    /**
     * @param int $notation
     */
    public function setNotation($notation)
    {
        $this->notation = $notation;
    }

    /**
     * @return string
     */
    public function getComment()
    {
        return $this->comment;
    }

    /**
     * @param string $comment
     */
    public function setComment($comment)
    {
        $this->comment = $comment;
    }

    /**
     * @return $votes
     */
    public function getVotes()
    {
        return $this->votes;
    }

    /**
     * @param $votes
     */
    public function setVotes($votes)
    {
        $this->votes = $votes;
    }

    /**
     * @return int
     */
    public function getPublishedChildrenCount()
    {
        return $this->publishedChildrenCount;
    }

    /**
     * @param int $publishedChildrenCount
     */
    public function setPublishedChildrenCount($publishedChildrenCount)
    {
        $this->publishedChildrenCount = $publishedChildrenCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getPublishedParentChildrenCount()
    {
        return $this->publishedParentChildrenCount;
    }

    /**
     * @param int $publishedParentChildrenCount
     */
    public function setPublishedParentChildrenCount($publishedParentChildrenCount)
    {
        $this->publishedParentChildrenCount = $publishedParentChildrenCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getChildrenScore()
    {
        return $this->childrenScore;
    }

    /**
     * @param int $childrenScore
     */
    public function setChildrenScore($childrenScore)
    {
        $this->childrenScore = $childrenScore;

        return $this;
    }

    /**
     * @return int
     */
    public function getParentChildrenScore()
    {
        return $this->parentChildrenScore;
    }

    /**
     * @param int $parentChildrenScore
     */
    public function setParentChildrenScore($parentChildrenScore)
    {
        $this->parentChildrenScore = $parentChildrenScore;

        return $this;
    }

    /**
     * @return string
     */
    public function getLinkedDataClass()
    {
        return $this->linkedDataClass;
    }

    /**
     * @param string $linkedDataClass
     */
    public function setLinkedDataClass($linkedDataClass)
    {
        $this->linkedDataClass = $linkedDataClass;
    }

    /**
     * @return mixed
     */
    public function getLinkedDataCreation()
    {
        return $this->linkedDataCreation;
    }

    /**
     * @param mixed $linkedDataCreation
     */
    public function setLinkedDataCreation($linkedDataCreation)
    {
        $this->linkedDataCreation = $linkedDataCreation;
    }

    /**
     * @return string
     */
    public function getLinkedDataId()
    {
        return $this->linkedDataId;
    }

    /**
     * @param string $linkedDataId
     */
    public function setLinkedDataId($linkedDataId)
    {
        $this->linkedDataId = $linkedDataId;
    }

    public function getLinkedDataLastUpdate()
    {
        return $this->linkedDataLastUpdate;
    }

    public function setLinkedDataLastUpdate($linkedDataLastUpdate)
    {
        $this->linkedDataLastUpdate = $linkedDataLastUpdate;
    }

    /**
     * @return string
     */
    public function getLinkedDataUrl()
    {
        return $this->linkedDataUrl;
    }

    /**
     * @param string $linkedDataUrl
     */
    public function setLinkedDataUrl($linkedDataUrl)
    {
        $this->linkedDataUrl = $linkedDataUrl;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getLevel()
    {
        return $this->level;
    }

    /**
     * @param mixed $level
     */
    public function setLevel($level)
    {
        $this->level = $level;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param mixed $path
     */
    public function setPath($path)
    {
        $this->path = $path;

        return $this;
    }

    //************************** Custom methods *****************************

    public function hasLinkedData(): bool
    {
        return $this->linkedDataClass && $this->linkedDataId;
    }

    public function getDecodedBody()
    {
        return $this->body ? html_entity_decode($this->body, \ENT_QUOTES) : null;
    }

    public function getChildrenCount()
    {
        return \count($this->children);
    }

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PrePersist
     */
    public function init()
    {
        if (null === $this->updatedAt) {
            $this->updatedAt = new \DateTime();
        }
        if (null === $this->votes) {
            $this->votes = [];
        }
        if (null === $this->children) {
            $this->children = new ArrayCollection();
        }
        if (null === $this->displayType) {
            $this->displayType = 'folder';
        }
    }
}
