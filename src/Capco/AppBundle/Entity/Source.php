<?php

namespace Capco\AppBundle\Entity;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Source
 *
 * @ORM\Table(name="source")
 * @ORM\Entity
 */
class Source
{
    const TYPE_FOR  = 1;
    const LINK = 0;
    const FILE = 1;

    public static $TypesLabels = [
        self::LINK => 'source.type.link',
        self::FILE => 'source.type.file'
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
     * @ORM\Column(name="title", type="string", length=100)
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
     * @ORM\Column(name="link", type="text", length=255, nullable=true)
     * @Assert\NotBlank(groups={"link"})
     * @Assert\Url(groups={"link"})
     */
    private $link;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=false)
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Sources")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false)
     */
    private $Opinion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Category", inversedBy="Sources")
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=false)
     */
    private $Category;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true)
     * @Assert\NotBlank(groups={"file"})
     */
    private $Media;

    /**
     * @var int
     */
    private $type;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\SourceVote", mappedBy="source", cascade={"persist", "remove"})
     */
    private $Votes;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count_source", type="integer")
     */
    private $voteCountSource = 0;

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New source";
        }

    }

    function __construct()
    {
        $this->type = self::LINK;
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
     * Set title
     *
     * @param string $title
     *
     * @return Source
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
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
     * Set link
     *
     * @param string $link
     *
     * @return Source
     */
    public function setLink($link)
    {
        $this->link = $link;

        return $this;
    }

    /**
     * Get link
     *
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * Set body
     *
     * @param string $body
     *
     * @return Source
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * Get body
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
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
     * @return mixed
     */
    public function getOpinion()
    {
        return $this->Opinion;
    }

    /**
     * @param mixed $Opinion
     */
    public function setOpinion($Opinion)
    {
        $this->Opinion = $Opinion;
    }

    /**
     * @return int
     */
    public function getVoteCountSource()
    {
        return $this->voteCountSource;
    }

    /**
     * @param int $voteCountSource
     */
    public function setVoteCountSource($voteCountSource)
    {
        $this->voteCountSource = $voteCountSource;
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
     * @return mixed
     */
    public function getCategory()
    {
        return $this->Category;
    }

    /**
     * @param mixed $Category
     */
    public function setCategory($Category)
    {
        $this->Category = $Category;
    }

    /**
     * @return mixed
     */
    public function getMedia()
    {
        return $this->Media;
    }

    /**
     * @param mixed $Media
     */
    public function setMedia($Media)
    {
        $this->Media = $Media;
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param mixed $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    public function resetVotes(){
        $this->voteCountSource = 0;
        return $this;
    }

    public function addVote(){
        $this->voteCountSource++;
        return $this;
    }

    public function removeVote(){
        $this->voteCountSource--;
        return $this;
    }

    public function userHasVote(User $user = null){
        if ($user != null) {
            foreach($this->Votes as $vote) {
                if ($vote->getVoter() == $user) {
                    return true;
                }
            }
        }
        return false;
    }

}

