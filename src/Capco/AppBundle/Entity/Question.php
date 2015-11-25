<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Question.
 *
 * @ORM\Table(name="question")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionRepository")
 */
class Question
{
    use TimestampableTrait;
    use SluggableTitleTrait;
    use PositionableTrait;

    const QUESTION_TYPE_SIMPLE_TEXT    = 0;
    const QUESTION_TYPE_MULTILINE_TEXT = 1;

    public static $questionTypes = [
        self::QUESTION_TYPE_SIMPLE_TEXT    => 'question_type.types.simple_text',
        self::QUESTION_TYPE_MULTILINE_TEXT => 'question_type.types.multiline_text',
    ];

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
     * @ORM\Column(name="helpText", type="text")
     */
    private $helpText;

    /**
     * @var ProposalForm
     *
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="questions", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $proposalForm;

    /**
     * @var int
     * @Assert\NotNull()
     * @Assert\Choice(choices={0, 1})
     * @ORM\Column(name="questionType", type="integer")
     */
    private $questionType;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\QuestionChoice", mappedBy="question", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=true)
     */
    protected $questionChoices;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalResponse", mappedBy="question")
     */
    private $proposalResponses;

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getTitle();
        }

        return 'New Question';
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
     * Set helpText.
     *
     * @param string $helpText
     *
     * @return Question
     */
    public function setHelpText($helpText)
    {
        $this->helpText = $helpText;

        return $this;
    }

    /**
     * Get helpText.
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
     *
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
     *
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
     *
     * @return $this
     */
    public function setProposalForm($proposalForm)
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    /**
     * @return int
     */
    public function getQuestionType()
    {
        return $this->questionType;
    }

    /**
     * @param int $questionType
     *
     * @return $this
     */
    public function setQuestionType($questionType)
    {
        $this->questionType = $questionType;

        return $this;
    }
}
