<?php

namespace Capco\AppBundle\Entity\Synthesis;

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
 * @Gedmo\SoftDeleteable(fieldName="deletedAt")
 */
class SynthesisElement
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    private $id;

    /**
     * @ORM\Column(name="published", type="boolean")
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
     * @ORM\Column(name="archived", type="boolean")
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
    private $originalDivision = null;

    /**
     * @var
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisDivision", inversedBy="originalElement", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="division_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Gedmo\Versioned
     */
    private $division = null;

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
    private $parent = null;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="parent", cascade={"persist"})
     * @ORM\OrderBy({"createdAt" = "ASC"})
     */
    private $children;

    /**
     * @var string
     * @ORM\Column(name="display_type", type="string", length=255, nullable=false)
     * @Assert\Choice(choices={"folder", "contribution", "source"})
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
     * @var string
     *
     * @ORM\Column(name="linked_data_class", type="string", length=255, nullable=true)
     */
    private $linkedDataClass = null;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_id", type="string", length=255, nullable=true)
     */
    private $linkedDataId = null;

    /**
     * @var datetime
     *
     * @ORM\Column(name="linked_data_last_update", type="datetime", nullable=true)
     */
    private $linkedDataLastUpdate = null;

    /**
     * @var \DateTime
     * @ORM\Column(name="linked_data_creation", type="datetime", nullable=true)
     */
    private $linkedDataCreation = null;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_url", type="string", length=255, nullable=true)
     */
    private $linkedDataUrl = null;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->votes = array();
        $this->children = new ArrayCollection();
        $this->displayType = 'folder';
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getSynthesis()
    {
        return $this->synthesis;
    }

    /**
     * @param Synthesis $synthesis
     */
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
     * @return \DateTime
     */
    public function getDeletedAt()
    {
        return $this->deletedAt;
    }

    /**
     * @param \DateTime $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;
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

    /**
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
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

    /**
     * @return datetime
     */
    public function getLinkedDataLastUpdate()
    {
        return $this->linkedDataLastUpdate;
    }

    /**
     * @param datetime $linkedDataLastUpdate
     */
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

    /**
     * @return string
     */
    public function hasLinkedData()
    {
        return $this->linkedDataClass && $this->linkedDataId;
    }

    public function getDecodedBody()
    {
        return $this->body ? html_entity_decode($this->body, ENT_QUOTES) : null;
    }

    public function getChildrenCount()
    {
        return count($this->children);
    }

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PrePersist
     */
    public function init()
    {
        if ($this->updatedAt === null) {
            $this->updatedAt = new \DateTime();
        }
        if ($this->votes === null) {
            $this->votes = array();
        }
        if ($this->children === null) {
            $this->children = new ArrayCollection();
        }
        if ($this->displayType === null) {
            $this->displayType = 'folder';
        }
    }
}
