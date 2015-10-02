<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
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
     */
    private $title;

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
     * Set title
     *
     * @param string $title
     * @return Question
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
     * Set helpText
     *
     * @param string $helpText
     * @return Question
     */
    public function setHelpTest($helpText)
    {
        $this->helpText = $helpText;

        return $this;
    }

    /**
     * Get helpText
     *
     * @return string 
     */
    public function getHelpTest()
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
     */
    public function setQuestionReponses($questionChoices)
    {
        $this->questionChoices = $questionChoices;
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
     */
    public function setProposalResponses($proposalResponses)
    {
        $this->proposalResponses = $proposalResponses;
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
     */
    public function setProposalForm($proposalForm)
    {
        $this->proposalForm = $proposalForm;
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
     */
    public function setQuestionType($questionType)
    {
        $this->questionType = $questionType;
    }
}
