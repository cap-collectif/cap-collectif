<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as Serializer;
use Hateoas\Configuration\Annotation as Hateoas;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * SynthesisElement.
 *
 * @ORM\Table(name="synthesis_element")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Synthesis\SynthesisElementRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Gedmo\Loggable()
 * @Gedmo\SoftDeleteable(fieldName="deletedAt")
 * @Serializer\ExclusionPolicy("all")
 * @Hateoas\Relation(
 *      "self",
 *      href = @Hateoas\Route(
 *          "get_synthesis_element",
 *          parameters = {
 *              "synthesis_id" = "expr(object.getSynthesis().getId())",
 *              "element_id" = "expr(object.getId())"
 *          }
 *      ),
 *      exclusion = @Hateoas\Exclusion(groups = {"Elements", "ElementDetails"})
 * )
 * @Hateoas\Relation(
 *      "divide",
 *      href = @Hateoas\Route(
 *          "divide_synthesis_element",
 *          parameters = {
 *              "synthesis_id" = "expr(object.getSynthesis().getId())",
 *              "element_id" = "expr(object.getId())"
 *          }
 *      ),
 *      exclusion = @Hateoas\Exclusion(groups = {"Elements", "ElementDetails"})
 * )
 * @Hateoas\Relation(
 *      "history",
 *      href = @Hateoas\Route(
 *          "get_synthesis_element_history",
 *          parameters = {
 *              "synthesis_id" = "expr(object.getSynthesis().getId())",
 *              "element_id" = "expr(object.getId())"
 *          }
 *      ),
 *      exclusion = @Hateoas\Exclusion(groups = {"Elements", "ElementDetails"})
 * )
 */
class SynthesisElement
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     * @Serializer\Expose
     * @Serializer\Groups({"Elements", "ElementDetails"})
     */
    private $id;

    /**
     * @ORM\Column(name="enabled", type="boolean")
     * @Gedmo\Versioned
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $enabled = true;

    /**
     * @var \DateTime
     * @ORM\Column(name="created_at", type="datetime")
     * @Gedmo\Timestampable(on="create")
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body", "archived", "enabled", "parent", "notation"})
     * @ORM\Column(name="updated_at", type="datetime")
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
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
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
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
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails", "UserDetails"})
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", inversedBy="children", cascade={"persist"})
     * @Gedmo\Versioned
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $parent = null;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="parent", cascade={"persist"})
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $children;

    /**
     * @var string
     * @ORM\Column(name="display_type", type="string", length=255, nullable=false)
     * @Assert\Choice(choices={"folder", "contribution"})
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $displayType;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     * @Gedmo\Versioned
     * @Serializer\Expose
     * @Serializer\Groups({"Elements", "ElementDetails"})
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text", nullable=true)
     * @Gedmo\Versioned
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $body;

    /**
     * @var int
     *
     * @ORM\Column(name="notation", type="integer", nullable=true)
     * @Gedmo\Versioned
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $notation;

    /**
     * @var int
     *
     * @ORM\Column(name="votes", type="array", nullable=true)
     * @Gedmo\Versioned
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     */
    private $votes;

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
     * @Serializer\Expose
     * @Serializer\Groups({"ElementDetails"})
     * @Serializer\SerializedName("linkedDataCreation")
     */
    private $linkedDataCreation = null;

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
    public function setOriginalDivision($originalDivision)
    {
        $this->originalDivision = $originalDivision;
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
     * @return mixed
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param mixed $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
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

    //************************** Custom methods *****************************

    /**
     * @Serializer\VirtualProperty
     * @Serializer\SerializedName("hasLinkedData")
     * @Serializer\Groups({"ElementDetails"})
     *
     * @return string
     */
    public function hasLinkedData()
    {
        return $this->linkedDataClass && $this->linkedDataId;
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
