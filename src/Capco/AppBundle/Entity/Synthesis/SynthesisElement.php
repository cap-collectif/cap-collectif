<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Gedmo\Mapping\Annotation as Gedmo;

use JMS\Serializer\Annotation as Serializer;

use Hateoas\Configuration\Annotation as Hateoas;

/**
 * SynthesisElement
 *
 * @ORM\Table(name="synthesis_element")
 * @ORM\Entity()
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
 *      )
 * )
 * @Hateoas\Relation(
 *      "divide",
 *      href = @Hateoas\Route(
 *          "divide_synthesis_element",
 *          parameters = {
 *              "synthesis_id" = "expr(object.getSynthesis().getId())",
 *              "element_id" = "expr(object.getId())"
 *          }
 *      )
 * )
 * @Hateoas\Relation(
 *      "history",
 *      href = @Hateoas\Route(
 *          "get_synthesis_element_history",
 *          parameters = {
 *              "synthesis_id" = "expr(object.getSynthesis().getId())",
 *              "element_id" = "expr(object.getId())"
 *          }
 *      )
 * )
 * @Hateoas\Relation(
 *      name = "parent",
 *      embedded = @Hateoas\Embedded(
 *          "expr(object.getParent())",
 *          exclusion = @Hateoas\Exclusion(
 *              groups = {"ElementDetails"},
 *              excludeIf = "expr(!object.getParent())"
 *          )
 *      )
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
     * @var \DateTime $deletedAt
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisDivision", inversedBy="elements", cascade={"persist"})
     * @ORM\JoinColumn(name="original_division_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Gedmo\Versioned
     */
    private $originalDivision;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement")
     * @Gedmo\Versioned
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $parent = null;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     * @Gedmo\Versioned
     * @Serializer\Expose
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
}
