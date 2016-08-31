<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\AnswerableTrait;
use Capco\AppBundle\Traits\CommentableTrait;
use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Traits\ExpirableTrait;

/**
 * Proposal.
 *
 * @ORM\Table(name="proposal")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Gedmo\SoftDeleteable(fieldName="deletedAt")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="proposal.missing_required_responses", formField="proposalForm")
 * @CapcoAssert\HasThemeIfMandatory()
 * @CapcoAssert\HasCategoryIfMandatory()
 * @CapcoAssert\HasOnlyOneSelectionPerStep()
 */
class Proposal implements Contribution, CommentableInterface, VotableInterface
{
    use CommentableTrait;
    use TimestampableTrait;
    use VotableOkTrait;
    use EnableTrait;
    use TrashableTrait;
    use SluggableTitleTrait;
    use SoftDeleteableEntity;
    use AnswerableTrait;
    use ExpirableTrait;

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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District", inversedBy="proposals", cascade={"persist"})
     * @ORM\JoinColumn(name="district_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @CapcoAssert\HasDistrictIfActivated()
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
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Response", mappedBy="proposal", cascade={"persist", "remove"})
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
     * Constructor.
     */
    public function __construct()
    {
        $this->votes = new ArrayCollection();
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
        if ($this->getId()) {
            return $this->getTitle();
        }

        return 'New proposal';
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

    /**
     * @param District $district
     *
     * @return $this
     */
    public function setDistrict(District $district)
    {
        $this->district = $district;
        $district->addProposal($this);

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
     * @return null|CollectStep
     */
    public function getStep()
    {
        return $this->proposalForm ? $this->proposalForm->getStep() : null;
    }

    /**
     * Add response.
     *
     * @param Response $response
     *
     * @return Proposal
     */
    public function addResponse(Response $response)
    {
        if (!$this->responses->contains($response)) {
            $this->responses[] = $response;
            $response->setProposal($this);
        }

        return $this;
    }

    /**
     * Remove response.
     *
     * @param Response $response
     */
    public function removeResponse(Response $response)
    {
        $this->responses->removeElement($response);
    }

    /**
     * @return ArrayCollection
     */
    public function getResponses()
    {
        return $this->responses;
    }

    /**
     * @param ArrayCollection $responses
     *
     * @return $this
     */
    public function setResponses(ArrayCollection $responses)
    {
        $this->responses = $responses;
        foreach ($responses as $response) {
            $response->setProposal($this);
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getReports()
    {
        return $this->reports;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function addReport(Reporting $report)
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
        }

        return $this;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function removeReport(Reporting $report)
    {
        $this->reports->removeElement($report);

        return $this;
    }

    public function addSelection(Selection $selection)
    {
        if (!$this->selections->contains($selection)) {
            $this->selections[] = $selection;
            $selection->setProposal($this);
        }

        return $this;
    }

    public function removeSelection(Selection $selection)
    {
        $this->selections->removeElement($selection);
    }

    public function getSelections()
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

    public function setProgressSteps(ArrayCollection $progressSteps) : self
    {
        $this->progressSteps = $progressSteps;

        return $this;
    }

    public function addProgressStep(ProgressStep $progressStep) : self
    {
        if (!$this->progressSteps->contains($progressStep)) {
            $this->progressSteps->add($progressStep);
            $progressStep->setProposal($this);
        }

        return $this;
    }

    public function removeProgressStep(ProgressStep $progressStep) : self
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
}
