<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Proposal.
 *
 * @ORM\Table(name="proposal")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Proposal implements CommentableInterface
{
    use CommentableTrait;
    use TimestampableTrait;
    use VotableOkTrait;
    use EnableTrait;
    use TrashableTrait;
    use SluggableTitleTrait;

    public static $ratings = [1, 2, 3, 4, 5];

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var int
     *
     * @ORM\Column(name="rating", type="integer", nullable=true)
     */
    private $rating;

    /**
     * @var string
     *
     * @ORM\Column(name="annotation", type="text", nullable=true)
     */
    private $annotation;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="proposals", cascade={"persist"})
     * @ORM\JoinColumn(name="theme_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $theme = null;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="proposals")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $author;

    /**
     * @var ProposalForm
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="proposals")
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $proposalForm;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count", type="integer")
     */
    private $voteCount = 0;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalVote", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $votes;

    /**
     * @var ArrayCollection
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalComment", mappedBy="proposal", cascade={"persist", "remove"})
     */
    private $comments;

    /**
     * @var ArrayCollection
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalResponse", mappedBy="proposal", cascade={"persist", "remove"})
     */
    private $proposalResponses;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->voteCount = 0;
        $this->commentsCount = 0;
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getTitle();
        } else {
            return 'New proposal';
        }
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
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
     *
     * @return $this
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @return int
     */
    public function getRating()
    {
        return $this->rating;
    }

    /**
     * @param int $rating
     *
     * @return $this
     */
    public function setRating($rating)
    {
        $this->rating = $rating;

        return $this;
    }

    /**
     * @return string
     */
    public function getAnnotation()
    {
        return $this->annotation;
    }

    /**
     * @param string $annotation
     *
     * @return $this
     */
    public function setAnnotation($annotation)
    {
        $this->annotation = $annotation;

        return $this;
    }

    /**
     * @return Theme
     */
    public function getTheme()
    {
        return $this->theme;
    }

    /**
     * @param Theme $theme
     *
     * @return $this
     */
    public function setTheme(Theme $theme)
    {
        $this->theme = $theme;
        $theme->addProposal($this);

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getVotes()
    {
        return $this->votes;
    }

    /**
     * @param ArrayCollection $votes
     *
     * @return $this
     */
    public function setVotes($votes)
    {
        $this->votes = $votes;

        return $this;
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param User $author
     *
     * @return $this
     */
    public function setAuthor(User $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return ProposalForm
     */
    public function getProposalForm()
    {
        return $this->proposalForm;
    }

    /**
     * @param ProposalForm $proposalForm
     *
     * @return $this
     */
    public function setProposalForm(ProposalForm $proposalForm)
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    /**
     * @return CollectStep
     */
    public function getStep()
    {
        return $this->proposalForm->getStep();
    }

    // CommentableInterface methods implementation
    /**
     * @return string
     */
    public function getClassName()
    {
        return 'Proposal';
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->enabled && !$this->isTrashed && $this->getStep()->canDisplay();
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->enabled && !$this->isTrashed && $this->getStep()->canContribute();
    }

    /**
     * @return ArrayCollection
     */
    public function getProposalResponses()
    {
        return $this->proposalResponses;
    }

    /**
     * @param ArrayCollection $proposalResponses
     *
     * @return $this
     */
    public function setProposalResponses($proposalResponses)
    {
        $this->proposalResponses = $proposalResponses;

        return $this;
    }
}
