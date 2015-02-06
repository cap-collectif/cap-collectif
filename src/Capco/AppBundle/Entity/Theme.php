<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Theme
 *
 * @ORM\Table(name="theme")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ThemeRepository")
 */
class Theme
{
    const STATUS_CLOSED = 0;
    const STATUS_OPENED = 1;
    const STATUS_FUTURE = 2;

    const FILTER_ALL = 'all';

    public static $statuses = [
        'closed' => self::STATUS_CLOSED,
        'opened' => self::STATUS_OPENED,
        'future' => self::STATUS_FUTURE,
    ];

    public static $statusesLabels = [
        self::STATUS_CLOSED => 'theme.show.status.closed',
        self::STATUS_OPENED => 'theme.show.status.opened',
        self::STATUS_FUTURE => 'theme.show.status.future',
    ];

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     * @Assert\NotNull()
     * @Assert\NotBlank()
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="teaser", type="string", length=255, nullable=true)
     */
    private $teaser;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var integer
     *
     * @ORM\Column(name="position", type="integer")
     * @Assert\NotNull()
     */
    private $position;

    /**
     * @var integer
     *
     * @ORM\Column(name="status", type="integer", nullable=true)
     */
    private $status;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotNull()
     */
    private $body;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id")
     * @Assert\NotNull()
     */
    private $Author;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "teaser", "position", "status", "body", "Media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Consultation", mappedBy="Themes", cascade={"persist"})
     */
    private $Consultations;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Idea", mappedBy="Theme", cascade={"persist", "remove"})
     */
    private $Ideas;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $Media;

    function __construct()
    {
        $this->Consultations = new ArrayCollection();
        $this->Ideas = new ArrayCollection();
        $this->updatedAt = new \Datetime;
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New theme";
        }
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Theme
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
    }

    /**
     * Get teaser
     *
     * @return string
     */
    public function getTeaser()
    {
        return $this->teaser;
    }

    /**
     * Set teaser
     *
     * @param string $teaser
     * @return Theme
     */
    public function setTeaser($teaser)
    {
        $this->teaser = $teaser;

        return $this;
    }

    /**
     * @return boolean
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * @param boolean $isEnabled
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;
    }

    /**
     * @return mixed
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param mixed $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
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
    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param mixed $Author
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;
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
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getConsultations()
    {
        return $this->Consultations;
    }

    /**
     * @param Capco\AppBundle\Entity\Consultation $Consultation
     * @return Theme
     */
    public function addConsultation(Consultation $Consultation)
    {
        if (!$this->Consultations->contains($Consultation)) {
            $this->Consultations->add($Consultation);
        }
        return $this;
    }

    /**
     * @param Consultation $Consultation
     * @return $this
     */
    public function removeConsultation(Consultation $Consultation)
    {
        $this->Consultations->removeElement($Consultation);
        return $this;
    }

    /**
     * Get ideas
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getIdeas()
    {
        return $this->Ideas;
    }

    /**
     * Add idea
     *
     * @param \Capco\AppBundle\Entity\Idea $idea
     *
     * @return Theme
     */
    public function addIdea(\Capco\AppBundle\Entity\Idea $idea)
    {
        if (!$this->Ideas->contains($idea)) {
            $this->Ideas[] = $idea;
        }
        return $this;
    }

    /**
     * Remove idea
     *
     * @param \Capco\AppBundle\Entity\Idea $idea
     */
    public function removeIdea(\Capco\AppBundle\Entity\Idea $idea)
    {
        $this->Ideas->removeElement($idea);
    }

    /**
     * @return mixed
     */
    public function getMedia()
    {
        return $this->Media;
    }

    /**
     * @param mixed $media
     */
    public function setMedia($media)
    {
        $this->Media = $media;
    }

    // ********************** custom methods ****************************

    public function getBodyExcerpt($nb = 100){
        $excerpt = substr($this->body, 0, $nb);
        $excerpt = $excerpt.'...';
        return $excerpt;
    }

    public function getTeaserExcerpt($nb = 100){
        $excerpt = substr($this->teaser, 0, $nb);
        $excerpt = $excerpt.'...';
        return $excerpt;
    }

    public function canContribute()
    {
        return ($this->isEnabled);
    }

    public function canDisplay()
    {
        return ($this->isEnabled);
    }

    public function countEnabledConsultations()
    {
        $count = 0;
        foreach ($this->Consultations as $consultation) {
            if (true == $consultation->getIsEnabled()) {
                $count++;
            }
        }
        return $count;
    }

    public function countEnabledIdeas()
    {
        $count = 0;
        foreach ($this->Ideas as $idea) {
            if (true == $idea->getIsEnabled()) {
                $count++;
            }
        }
        return $count;
    }


}
