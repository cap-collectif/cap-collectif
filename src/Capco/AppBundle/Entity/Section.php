<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Entity\Steps\AbstractStep;

/**
 * Section.
 *
 * @ORM\Table(name="section")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SectionRepository")
 */
class Section
{
    public static $fieldsForType = [
        'highlight' => [
            'title'     => true,
            'teaser'    => false,
            'body'      => false,
            'nbObjects' => false,
        ],
        'introduction' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => true,
            'nbObjects' => false,
        ],
        'videos' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'projects' => [
            'title'     => false,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'themes' => [
            'title'     => false,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'ideas' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'news' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'events' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'newsletter' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => false,
        ],
        'social-networks' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => false,
        ],
        'proposals' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => false,
            'nbObjects' => true,
        ],
        'custom' => [
            'title'     => true,
            'teaser'    => true,
            'body'      => true,
            'nbObjects' => false,
        ],
    ];

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="type", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $type = 'custom';

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=100, nullable=true)
     */
    private $title;

    /**
     * @var int
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     * @Assert\NotNull()
     */
    private $position;

    /**
     * @var string
     *
     * @ORM\Column(name="teaser", type="text", nullable=true)
     */
    private $teaser;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    /**
     * @var int
     * @ORM\Column(name="nb_objects", type="integer", nullable=true)
     */
    private $nbObjects;

    /**
     * @var bool
     *
     * @ORM\Column(name="enabled", type="boolean")
     * @Assert\NotNull()
     */
    private $enabled;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="change", field={"title", "position"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     * @ORM\Column(name="associated_features", type="simple_array", nullable=true)
     */
    private $associatedFeatures;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     */
    protected $step;

    public function __construct()
    {
        $this->type = 'custom';
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New section';
    }

    /**
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
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param int $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
    }

    /**
     * @return string
     */
    public function getTeaser()
    {
        return $this->teaser;
    }

    /**
     * @param string $teaser
     */
    public function setTeaser($teaser)
    {
        $this->teaser = $teaser;
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
    public function getNbObjects()
    {
        return $this->nbObjects;
    }

    /**
     * @param mixed $nbObjects
     */
    public function setNbObjects($nbObjects)
    {
        $this->nbObjects = $nbObjects;
    }

    /**
     * @return bool
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param bool $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
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
     * @return mixed
     */
    public function getAssociatedFeatures()
    {
        return $this->associatedFeatures;
    }

    /**
     * @param mixed $associatedFeatures
     */
    public function setAssociatedFeatures($associatedFeatures)
    {
        $this->associatedFeatures = $associatedFeatures;
    }

    /**
     * @return mixed
     */
    public function getStep()
    {
        return $this->step;
    }

    /**
     * @param mixed $step
     */
    public function setStep(AbstractStep $step = null)
    {
        $this->step = $step;

        return $this;
    }

    // ************************* Custom methods ***********************************

    public function isCustom()
    {
        return $this->type == 'custom';
    }
}
