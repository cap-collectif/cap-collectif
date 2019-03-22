<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="section")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SectionRepository")
 */
class Section
{
    use IdTrait;
    use TextableTrait;

    public static $fieldsForType = [
        'highlight' => [
            'title' => true,
            'teaser' => false,
            'body' => false,
            'nbObjects' => false,
        ],
        'introduction' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false,
        ],
        'videos' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'projects' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'themes' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'news' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'events' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'newsletter' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => false,
        ],
        'social-networks' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => false,
        ],
        'proposals' => [
            'title' => true,
            'teaser' => true,
            'body' => false,
            'nbObjects' => true,
        ],
        'custom' => [
            'title' => true,
            'teaser' => true,
            'body' => true,
            'nbObjects' => false,
        ],
    ];

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", onDelete="SET NULL", nullable=true)
     */
    protected $step;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    /**
     * @ORM\Column(name="type", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $type = 'custom';

    /**
     * @ORM\Column(name="title", type="string", length=100, nullable=true)
     */
    private $title = '';

    /**
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     * @Assert\NotNull()
     */
    private $position;

    /**
     * @ORM\Column(name="teaser", type="text", nullable=true)
     */
    private $teaser;

    /**
     * @ORM\Column(name="nb_objects", type="integer", nullable=true)
     */
    private $nbObjects;

    /**
     * @ORM\Column(name="enabled", type="boolean")
     * @Assert\NotNull()
     */
    private $enabled;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "position"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="associated_features", type="simple_array", nullable=true)
     */
    private $associatedFeatures;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        $title = $this->getTitle() ?: '';

        return $this->getId() ? $title : 'New section';
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
        return 'custom' === $this->type;
    }
}
