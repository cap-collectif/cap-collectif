<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

use JMS\Serializer\Annotation as Serializer;
use JMS\Serializer\Annotation\Expose;
use JMS\Serializer\Annotation\Groups;

/**
 * SynthesisElement
 *
 * @ORM\Table(name="synthesis_element")
 * @ORM\Entity()
 * @Serializer\ExclusionPolicy("all")
 */
class SynthesisElement
{
    const STATUS_ARCHIVED = 100;
    const STATUS_IGNORED = 200;
    const STATUS_TRASHED = 300;
    const STATUS_NEW = 0;

    public static $statuses = [
        'new' => self::STATUS_NEW,
        'archived' => self::STATUS_ARCHIVED,
        'ignored' => self::STATUS_IGNORED,
        'trashed' => self::STATUS_TRASHED,
    ];

    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     * @Expose
     */
    private $id;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\Synthesis", inversedBy="elements", cascade={"persist"})
     * @ORM\JoinColumn(name="synthesis_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $synthesis;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $parent = null;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     * @Expose
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text", nullable=true)
     * @Expose
     * @Groups({"Details"})
     */
    private $body;

    /**
     * @var int
     *
     * @ORM\Column(name="status", type="integer")
     * @Expose
     * @Groups({"Details"})
     */
    private $status = self::STATUS_NEW;

    /**
     * @var int
     *
     * @ORM\Column(name="notation", type="integer", nullable=true)
     * @Expose
     * @Groups({"Details"})
     */
    private $notation;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_class", type="string", length=255, nullable=true)
     * @Expose
     * @Groups({"Details"})
     */
    private $linkedDataClass = null;

    /**
     * @var string
     *
     * @ORM\Column(name="linked_data_id", type="string", length=255, nullable=true)
     * @Expose
     * @Groups({"Details"})
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
     * @return int
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param int $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
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
