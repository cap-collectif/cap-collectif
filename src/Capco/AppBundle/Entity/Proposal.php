<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\AnswerableTrait;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\Common\Collections\Collection;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Traits\ExpirableTrait;
use Capco\AppBundle\Traits\IdTrait;

/**
 * @ORM\Table(name="proposal")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Gedmo\SoftDeleteable(fieldName="deletedAt")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="proposal.missing_required_responses", formField="proposalForm")
 * @CapcoAssert\HasDistrictIfMandatory()
 * @CapcoAssert\HasThemeIfMandatory()
 * @CapcoAssert\HasCategoryIfMandatory()
 * @CapcoAssert\HasOnlyOneSelectionPerStep()
 */
class Proposal implements Contribution, CommentableInterface
{
    use IdTrait;
    use CommentableTrait;
    use TimestampableTrait;
    use EnableTrait;
    use TrashableTrait;
    use SluggableTitleTrait;
    use SoftDeleteableEntity;
    use AnswerableTrait;
    use ExpirableTrait;

    public static $ratings = [1, 2, 3, 4, 5];

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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District", inversedBy="proposals", cascade={"persist"})
     * @ORM\JoinColumn(name="district_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $district = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"}, inversedBy="proposals")
     * @ORM\JoinColumn(name="status_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $status = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalCategory", cascade={"persist"}, inversedBy="proposals")
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $category = null;

    /**
     * @var string
     *
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="proposals")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $author;

    /**
     * @var ProposalForm
     *
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="proposals")
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $proposalForm;

    /**
     * @var ArrayCollection
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalComment", mappedBy="proposal", cascade={"persist", "remove"})
     */
    private $comments;

    /**
     * @var ArrayCollection
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse", mappedBy="proposal", cascade={"persist", "remove"})
     */
    private $responses;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $reports;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Selection", mappedBy="proposal", cascade={"persist"}, orphanRemoval=true)
     */
    private $selections;

    /**
     * @var
     * @ORM\Column(name="estimation", type="float", nullable=true)
     */
    private $estimation = null;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\UserBundle\Entity\User", cascade={"persist"})
     * @ORM\JoinTable(name="user_favorite_proposal")
     */
    protected $likers;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProgressStep", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $progressSteps;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $media;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalSelectionVote", mappedBy="proposal", cascade={"persist"})
     */
    private $selectionVotes;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalCollectVote", mappedBy="proposal", cascade={"persist"})
     */
    private $collectVotes;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    protected $votesCount = 0;

    public function __construct()
    {
        $this->selectionVotes = new ArrayCollection();
        $this->collectVotes = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->responses = new ArrayCollection();
        $this->commentsCount = 0;
        $this->updatedAt = new \Datetime();
        $this->selections = new ArrayCollection();
        $this->likers = new ArrayCollection();
        $this->progressSteps = new ArrayCollection();
    }

    public function isIndexable()
    {
        return $this->enabled && !$this->expired;
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New proposal';
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
     * @return Status
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param Status $status
     *
     * @return $this
     */
    public function setStatus(Status $status = null)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return ProposalCategory
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param ProposalCategory $category
     *
     * @return $this
     */
    public function setCategory(ProposalCategory $category = null)
    {
        $this->category = $category;

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
    public function setTheme(Theme $theme = null)
    {
        $this->theme = $theme;
        if ($theme) {
            $theme->addProposal($this);
        }

        return $this;
    }

    /**
     * @return District
     */
    public function getDistrict()
    {
        return $this->district;
    }

    public function setDistrict(District $district): self
    {
        $this->district = $district;
        $district->addProposal($this);

        return $this;
    }

    public function getAuthor()
    {
        return $this->author;
    }

    public function setAuthor(User $author) : self
    {
        $this->author = $author;

        return $this;
    }

    public function getProposalForm()
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm) : self
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function getStep()
    {
        return $this->proposalForm ? $this->proposalForm->getStep() : null;
    }

    public function addResponse(AbstractResponse $response) : self
    {
        if (!$this->responses->contains($response)) {
            $this->responses[] = $response;
            $response->setProposal($this);
        }

        return $this;
    }

    public function removeResponse(AbstractResponse $response): self
    {
        $this->responses->removeElement($response);

        return $this;
    }

    public function getResponses(): Collection
    {
        return $this->responses;
    }

    public function setResponses(Collection $responses) : self
    {
        $this->responses = $responses;
        foreach ($responses as $response) {
            $response->setProposal($this);
        }

        return $this;
    }

    public function getReports(): Collection
    {
        return $this->reports;
    }

    public function addReport(Reporting $report): self
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report): self
    {
        $this->reports->removeElement($report);

        return $this;
    }

    public function addSelection(Selection $selection): self
    {
        if (!$this->selections->contains($selection)) {
            $this->selections[] = $selection;
            $selection->setProposal($this);
        }

        return $this;
    }

    public function removeSelection(Selection $selection): self
    {
        $this->selections->removeElement($selection);

        return $this;
    }

    public function getSelections(): Collection
    {
        return $this->selections;
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

    public function isPrivate() : bool
    {
        return $this->getProposalForm() ? $this->getProposalForm()->getStep()->isPrivate() : false;
    }

    public function isSelected() : bool
    {
        return !$this->getSelections()->isEmpty();
    }

    public function isVisible() : bool
    {
        return !$this->isPrivate() || $this->isSelected();
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->enabled && !$this->isTrashed && $this->getStep()->canContribute();
    }

    public function canComment()
    {
        return $this->enabled && !$this->isTrashed && $this->getIsCommentable();
    }

    public function userHasReport(User $user)
    {
        foreach ($this->reports as $report) {
            if ($report->getReporter() == $user) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return float
     */
    public function getEstimation()
    {
        return $this->estimation;
    }

    /**
     * @param float $estimation
     *
     * @return $this
     */
    public function setEstimation($estimation)
    {
        $this->estimation = $estimation;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getLikers()
    {
        return $this->likers;
    }

    public function addLiker(User $liker)
    {
        if (!$this->likers->contains($liker)) {
            $this->likers[] = $liker;
        }

        return $this;
    }

    public function removeLiker(User $liker)
    {
        $this->likers->removeElement($liker);
    }

    /**
     * @return bool
     */
    public function isPublished()
    {
        return $this->enabled && !$this->isTrashed;
    }

    public function getSelectionSteps()
    {
        $steps = [];
        foreach ($this->selections as $selection) {
            $steps[] = $selection->getSelectionStep();
        }

        return $steps;
    }

    public function getProjectId()
    {
        if ($this->getProposalForm() && $this->getProposalForm()->getStep() && $this->getProposalForm()->getStep()->getProject()) {
            return $this->getProposalForm()->getStep()->getProjectId();
        }

        return;
    }

    public function getSelectionStepsIds()
    {
        $ids = array_filter(array_map(function ($value) {
            return $value->getSelectionStep() ? $value->getSelectionStep()->getId() : null;
        }, $this->getSelections()->getValues()),
            function ($value) {
                return $value !== null;
            });

        return $ids;
    }

    public function getProgressSteps() : Collection
    {
        return $this->progressSteps;
    }

    public function setProgressSteps(Collection $progressSteps) : self
    {
        $this->progressSteps = $progressSteps;

        return $this;
    }

    public function resetVotes()
    {
        foreach ($this->selectionVotes as $vote) {
            $this->removeVote($vote);
        }
        foreach ($this->collectVotes as $vote) {
            $this->removeVote($vote);
        }
        $this->votesCount = 0;

        return $this;
    }

    public function userHasVote(User $user = null)
    {
        if ($user != null) {
            foreach ($this->selectionVotes as $vote) {
                if ($vote->getUser() == $user) {
                    return true;
                }
            }
            foreach ($this->collectVotes as $vote) {
                if ($vote->getUser() == $user) {
                    return true;
                }
            }
        }

        return false;
    }

    public function getSelectionVotes()
    {
        return $this->selectionVotes;
    }

    public function setSelectionVotes(Collection $votes)
    {
        $this->selectionVotes = $votes;

        return $this;
    }

    public function getCollectVotes()
    {
        return $this->collectVotes;
    }

    public function setCollectVotes(Collection $collectVotes): self
    {
        $this->collectVotes = $collectVotes;

        return $this;
    }

    public function addSelectionVote(ProposalSelectionVote $selectionVote): self
    {
        if (!$this->selectionVotes->contains($selectionVote)) {
            $this->selectionVotes->add($selectionVote);
        }

        return $this;
    }

    public function removeSelectionVote(ProposalSelectionVote $vote): self
    {
        if ($this->selectionVotes->contains($vote)) {
            $this->selectionVotes->removeElement($vote);
        }

        return $this;
    }

    public function addCollectVote(ProposalCollectVote $vote): self
    {
        if (!$this->collectVotes->contains($vote)) {
            $this->collectVotes->add($vote);
        }

        return $this;
    }

    public function addProgressStep(ProgressStep $progressStep): self
    {
        if (!$this->progressSteps->contains($progressStep)) {
            $this->progressSteps->add($progressStep);
            $progressStep->setProposal($this);
        }
        return $this;
    }

    public function removeCollectVote(ProposalCollectVote $vote): self
    {
        if ($this->collectVotes->contains($vote)) {
            $this->collectVotes->removeElement($vote);
        }
        return $this;
    }

    public function removeProgressStep(ProgressStep $progressStep): self
    {
        if ($this->progressSteps->contains($progressStep)) {
            $this->progressSteps->removeElement($progressStep);
        }
        return $this;
    }

    public function canHaveProgessSteps() : bool
    {
        return $this->getProposalForm()->getStep()->getProject()->getSteps()->exists(function ($key, $step) {
            return $step->getStep()->isSelectionStep() && $step->getStep()->isAllowingProgressSteps();
        });
    }

    /**
     * @return Media
     */
    public function getMedia()
    {
        return $this->media;
    }

    /**
     * @param mixed $media
     */
    public function setMedia(Media $media = null)
    {
        $this->media = $media;
    }
}
