<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Idea.
 *
 * @ORM\Table(name="video")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\VideoRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Video implements DisplayableInBOInterface
{
    use IdTrait;

    public static $colorButtonPlay = [
        'white' => 'video.colors.white',
        'black' => 'video.colors.black',
    ];

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false)
     * @ORM\Column(length=255,  nullable=true)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

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
     * @Gedmo\Timestampable(on="change", field={"title", "body", "Author", "media", "link"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var int
     *
     * @ORM\Column(name="position", type="integer", nullable=true)
     */
    private $position = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="color", type="string", length=50)
     */
    private $color = 'white';

    /**
     * @ORM\Column(name="video", type="string")
     * @Assert\NotBlank()
     */
    private $link;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Author;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $media;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New video';
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return Video
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set slug.
     *
     * @param string $slug
     *
     * @return Video
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug.
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set body.
     *
     * @param string $body
     *
     * @return Video
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * Get body.
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt.
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
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
     * @return mixed
     */
    public function getMedia()
    {
        return $this->media;
    }

    /**
     * @param mixed $media
     */
    public function setMedia($media)
    {
        $this->media = $media;
    }

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return Video
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
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
     * @return mixed
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * @param mixed $link
     */
    public function setLink($link)
    {
        $this->link = $link;
    }

    /**
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @param string $color
     */
    public function setColor($color)
    {
        $this->color = $color;
    }

    public function canDisplayInBo($user = null): bool
    {
        return true;
    }
}
