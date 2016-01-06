<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\SelectionStep;
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
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Proposal.
 *
 * @ORM\Table(name="proposal")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Gedmo\SoftDeleteable(fieldName="deletedAt")
 */
class Proposal implements CommentableInterface, VotableInterface
{
    use CommentableTrait;
    use TimestampableTrait;
    use VotableOkTrait;
    use EnableTrait;
    use TrashableTrait;
    use SluggableTitleTrait;
    use SoftDeleteableEntity;
    use AnswerableTrait;

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
     * @Assert\NotNull()
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\JoinColumn(name="status_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $status = null;

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
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalResponse", mappedBy="proposal", cascade={"persist", "remove"})
     */
    private $proposalResponses;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $reports;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep", mappedBy="proposals", cascade={"persist"})
     */
    private $selectionSteps;

    /**
     * @var
     * @ORM\Column(name="estimation", type="float", nullable=true)
     */
    private $estimation;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->proposalResponses = new ArrayCollection();
        $this->commentsCount = 0;
        $this->updatedAt = new \Datetime();
        $this->selectionSteps = new ArrayCollection();
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
     * @return CollectStep
     */
    public function getStep()
    {
        return $this->proposalForm ? $this->proposalForm->getStep() : null;
    }

    /**
     * Add proposalResponse.
     *
     * @param ProposalResponse $proposalResponse
     *
     * @return Proposal
     */
    public function addProposalResponse(ProposalResponse $proposalResponse)
    {
        if (!$this->proposalResponses->contains($proposalResponse)) {
            $this->proposalResponses[] = $proposalResponse;
            $proposalResponse->setProposal($this);
        }

        return $this;
    }

    /**
     * Remove proposalResponse.
     *
     * @param ProposalResponse $proposalResponse
     */
    public function removeProposalResponse(ProposalResponse $proposalResponse)
    {
        $this->proposalResponses->removeElement($proposalResponse);
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
    public function setProposalResponses(ArrayCollection $proposalResponses)
    {
        $this->proposalResponses = $proposalResponses;
        foreach ($proposalResponses as $proposalResponse) {
            $proposalResponse->setProposal($this);
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

    /**
     * Add selection step.
     *
     * @param SelectionStep $selectionStep
     *
     * @return SelectionStep
     */
    public function addSelectionStep(SelectionStep $selectionStep)
    {
        if (!$this->selectionSteps->contains($selectionStep)) {
            $this->selectionSteps[] = $selectionStep;
            $selectionStep->addProposal($this);
        }

        return $this;
    }

    /**
     * Remove selectionStep.
     *
     * @param SelectionStep $selectionStep
     */
    public function removeSelectionStep(SelectionStep $selectionStep)
    {
        $this->selectionSteps->removeElement($selectionStep);
        $selectionStep->removeProposal($this);
    }

    /**
     * @return ArrayCollection
     */
    public function getSelectionSteps()
    {
        return $this->selectionSteps;
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
}
