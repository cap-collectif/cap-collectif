<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Question
 *
 * @ORM\Table(name="question")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionRepository")
 */
class Question
{

    use TimestampableTrait;
    use SluggableTitleTrait;

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
     * @ORM\Column(name="helpText", type="text")
     */
    private $helpText;

    /**
     * @var ProposalForm
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="questions")
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id")
     */
    private $proposalForm;

    /**
     * @var QuestionType
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\QuestionType")
     * @ORM\JoinColumn(name="question_type_id", referencedColumnName="id")
     */
    private $questionType;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\QuestionChoice", mappedBy="question")
     * @ORM\JoinColumn(nullable=true)
     */
    protected $questionChoices;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalResponse", mappedBy="question")
     */
    private $proposalResponses;

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
     * Set helpText
     *
     * @param string $helpText
     * @return Question
     */
    public function setHelpText($helpText)
    {
        $this->helpText = $helpText;
        return $this;
    }

    /**
     * Get helpText
     *
     * @return string 
     */
    public function getHelpText()
    {
        return $this->helpText;
    }

    /**
     * @return ArrayCollection
     */
    public function getQuestionChoices()
    {
        return $this->question_choices;
    }

    /**
     * @param ArrayCollection $questionChoices
     * @return $this
     */
    public function setQuestionChoices($questionChoices)
    {
        $this->questionChoices = $questionChoices;
        return $this;
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
     * @return $this
     */
    public function setProposalResponses($proposalResponses)
    {
        $this->proposalResponses = $proposalResponses;
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
     * @return $this
     */
    public function setProposalForm(ProposalForm $proposalForm)
    {
        $this->proposalForm = $proposalForm;
        return $this;
    }

    /**
     * @return QuestionType
     */
    public function getQuestionType()
    {
        return $this->questionType;
    }

    /**
     * @param QuestionType $questionType
     * @return $this
     */
    public function setQuestionType(QuestionType $questionType)
    {
        $this->questionType = $questionType;
        return $this;
    }
}
