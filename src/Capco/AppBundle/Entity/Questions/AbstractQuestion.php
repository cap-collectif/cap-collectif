<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="question")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractQuestionRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "question_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "simple"          = "SimpleQuestion",
 *      "multiple_choice" = "MultipleChoiceQuestion",
 *      "media"           = "MediaQuestion",
 * })
 */
abstract class AbstractQuestion
{
    use TimestampableTrait;
    use SluggableTitleTrait;
    use IdTrait;

    const QUESTION_TYPE_SIMPLE_TEXT = 0;
    const QUESTION_TYPE_MULTILINE_TEXT = 1;
    const QUESTION_TYPE_EDITOR = 2;
    const QUESTION_TYPE_RADIO = 3;
    const QUESTION_TYPE_SELECT = 4;
    const QUESTION_TYPE_CHECKBOX = 5;
    const QUESTION_TYPE_RANKING = 6;
    const QUESTION_TYPE_MEDIAS = 7;
    const QUESTION_TYPE_BUTTON = 8;

    public static $questionTypesInputs = [
        self::QUESTION_TYPE_SIMPLE_TEXT => 'text',
        self::QUESTION_TYPE_MULTILINE_TEXT => 'textarea',
        self::QUESTION_TYPE_EDITOR => 'editor',
        self::QUESTION_TYPE_RADIO => 'radio',
        self::QUESTION_TYPE_SELECT => 'select',
        self::QUESTION_TYPE_CHECKBOX => 'checkbox',
        self::QUESTION_TYPE_RANKING => 'ranking',
        self::QUESTION_TYPE_MEDIAS => 'medias',
        self::QUESTION_TYPE_BUTTON => 'button',
    ];

    public static $questionTypesLabels = [];

    /**
     * Needed by sonata admin.
     *
     * @ORM\OneToOne(
     *  targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion",
     *  mappedBy="question",
     *  orphanRemoval=true,
     *  cascade={"persist", "remove"}
     * )
     */
    protected $questionnaireAbstractQuestion;

    /**
     * @var \DateTime
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @Assert\NotNull()
     * @Assert\Range(min=0, max=8)
     * @ORM\Column(name="type", nullable=false)
     */
    protected $type;

    /**
     * @ORM\Column(name="help_text", type="text", nullable=true)
     */
    private $helpText = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse", mappedBy="question")
     */
    private $responses;

    /**
     * @ORM\Column(name="required", type="boolean", nullable=false)
     */
    private $required = false;

    /**
     * @var bool
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    private $private = false;

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getTitle();
        }

        return 'New Question';
    }

    public function setHelpText(string $helpText = null): self
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
    public function getResponses()
    {
        return $this->responses;
    }

    /**
     * @param ArrayCollection $responses
     *
     * @return $this
     */
    public function setResponses($responses)
    {
        $this->responses = $responses;

        return $this;
    }

    /**
     * @return bool
     */
    public function isRequired()
    {
        return $this->required;
    }

    /**
     * @param bool $required
     *
     * @return $this
     */
    public function setRequired($required)
    {
        $this->required = $required;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getQuestionnaireAbstractQuestion()
    {
        return $this->questionnaireAbstractQuestion;
    }

    /**
     * @param mixed $questionnaireAbstractQuestion
     *
     * @return $this
     */
    public function setQuestionnaireAbstractQuestion($questionnaireAbstractQuestion)
    {
        $this->questionnaireAbstractQuestion = $questionnaireAbstractQuestion;

        return $this;
    }

    /**
     * @return bool
     */
    public function isPrivate(): bool
    {
        return $this->private;
    }

    /**
     * @param bool $private
     *
     * @return $this
     */
    public function setPrivate(bool $private)
    {
        $this->private = $private;

        return $this;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    public function setType($type): self
    {
        $this->type = $type;

        return $this;
    }

    // ************************* Custom methods *********************

    public function getInputType()
    {
        if (array_key_exists($this->getType(), self::$questionTypesInputs)) {
            return self::$questionTypesInputs[$this->getType()];
        }
    }

    public function getPosition()
    {
        if ($this->questionnaireAbstractQuestion) {
            return $this->questionnaireAbstractQuestion->getPosition();
        }
    }

    public function getQuestionnaire()
    {
        if ($this->questionnaireAbstractQuestion) {
            return $this->questionnaireAbstractQuestion->getQuestionnaire();
        }
    }

    public function getQuestion()
    {
        if ($this->questionnaireAbstractQuestion) {
            return $this->questionnaireAbstractQuestion->getQuestion();
        }
    }

    /**
     * Get questionnaire id.
     *
     * @return int
     */
    public function getQuestionnaireId()
    {
        $questionnaire = $this->getQuestionnaire();

        return $questionnaire ? $questionnaire->getId() : null;
    }

    /**
     * Get question id.
     *
     * @return int
     */
    public function getQuestionId()
    {
        $question = $this->getQuestion();

        return $question ? $question->getId() : null;
    }

    public function updateTimestamp()
    {
        $now = new \DateTime();

        $this->setUpdatedAt($now);

        if ($this->getQuestionnaireAbstractQuestion() && $this->getQuestionnaireAbstractQuestion()->getProposalForm()) {
            $this->getQuestionnaireAbstractQuestion()->getProposalForm()->setUpdatedAt($now);
        }
    }
}
