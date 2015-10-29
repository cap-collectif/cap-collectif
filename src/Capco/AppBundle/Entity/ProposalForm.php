<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ProposalForm.
 *
 * @ORM\Table(name="proposal_form")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalFormRepository")
 */
class ProposalForm
{
    use TimestampableTrait;
    use SluggableTitleTrait;

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
     * @ORM\Column(name="description", type="text")
     */
    private $description;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\CollectStep", mappedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     **/
    private $steps;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="proposalForm")
     */
    private $proposals;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Question", mappedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $questions;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;


    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->steps     = new ArrayCollection();
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getTitle();
        }
        return 'New ProposalForm';
    }


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
     * Set description.
     *
     * @param string $description
     *
     * @return ProposalForm
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description.
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return mixed
     */
    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * @param ArrayCollection $proposals
     *
     * @return $this
     */
    public function setProposals(ArrayCollection $proposals)
    {
        $this->proposals = $proposals;

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getQuestions()
    {
        return $this->questions;
    }

    /**
     * @param ArrayCollection $questions
     *
     * @return $this
     */
    public function setQuestions($questions)
    {
        foreach ($questions as $question) {
            $question->setProposalForm($this);
        }
        $this->questions = $questions;
        return $this;
    }

    /**
     * Add question.
     *
     * @param Question $question
     * @return $this
     */
    public function addQuestion(Question $question)
    {
        if (!$this->questions->contains($question)) {
            $this->questions->add($question);
        }
        $question->setProposalForm($this);

        return $this;
    }

    /**
     * Remove question.
     *
     * @param Question $question
     * @return $this
     */
    public function removeQuestion(Question $question)
    {
        $this->questions->removeElement($question);
        $question->setProposalForm(null);

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getSteps()
    {
        return $this->steps;
    }

    /**
     * @param ArrayCollection $steps
     *
     * @return $this
     */
    public function setSteps(ArrayCollection $steps)
    {
        $this->steps = $steps;
        return $this;
    }

    /**
     * @return CollectStep
     */
    public function getCurrentStep()
    {
        $currentStep = null;
        // TODO: refacto to avoid the exponential increase of execution time based on the number of steps
        foreach($this->getSteps() as $step) {
            if ($step->getProposalForm()->getId() === $this->getId()) {
                $currentStep = $step;
            }
        }
        return $currentStep;
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->getCurrentStep()->canDisplay();
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->getCurrentStep()->canContribute();
    }
}
