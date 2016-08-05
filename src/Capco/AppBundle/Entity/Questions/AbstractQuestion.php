<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use JMS\Serializer\Annotation as Serializer;

/**
 * AbstractQuestion.
 *
 * @ORM\Table(name="question")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractQuestionRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "question_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "simple"          = "SimpleQuestion",
 *      "multiple_choice" = "MultipleChoiceQuestion",
 * })
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\Discriminator(field = "question_type", map = {
 *      "simple"          = "Capco\AppBundle\Entity\Questions\SimpleQuestion",
 *      "multiple_choice" = "Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion",
 * })
 */
abstract class AbstractQuestion
{
    use TimestampableTrait;
    use SluggableTitleTrait;

    const QUESTION_TYPE_SIMPLE_TEXT = 0;
    const QUESTION_TYPE_MULTILINE_TEXT = 1;
    const QUESTION_TYPE_EDITOR = 2;
    const QUESTION_TYPE_RADIO = 3;
    const QUESTION_TYPE_SELECT = 4;
    const QUESTION_TYPE_CHECKBOX = 5;
    const QUESTION_TYPE_RANKING = 6;

    public static $questionTypesInputs = [
        self::QUESTION_TYPE_SIMPLE_TEXT => 'text',
        self::QUESTION_TYPE_MULTILINE_TEXT => 'textarea',
        self::QUESTION_TYPE_EDITOR => 'editor',
        self::QUESTION_TYPE_RADIO => 'radio',
        self::QUESTION_TYPE_SELECT => 'select',
        self::QUESTION_TYPE_CHECKBOX => 'checkbox',
        self::QUESTION_TYPE_RANKING => 'ranking',
    ];

    public static $questionTypesLabels = [];

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
     * @ORM\Column(name="help_text", type="text", nullable=true)
     */
    private $helpText = null;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Response", mappedBy="question")
     */
    private $responses;

    /**
     * @var bool
     * @ORM\Column(name="required", type="boolean", nullable=false)
     */
    private $required = false;

    /**
     * Needed by sonata admin.
     *
     * @var QuestionnaireAbstractQuestion
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="question",
     *                                                                                              orphanRemoval=true,
     *                                                                                              cascade={"persist",
     *                                                                                              "remove"})
     */
    protected $questionnaireAbstractQuestion;

    /**
     * @var \DateTime
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @var string
     * @Assert\NotNull()
     * @Assert\Range(min=0, max=6)
     * @ORM\Column(name="type", nullable=false)
     */
    protected $type;

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
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type
     *
     * @return $this
     */
    public function setType($type)
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

        return;
    }

    /**
     * Get position.
     *
     * @return int
     */
    public function getPosition()
    {
        if ($this->questionnaireAbstractQuestion) {
            return $this->questionnaireAbstractQuestion->getPosition();
        }

        return;
    }

    /**
     * Get questionnaire.
     *
     * @return Questionnaire
     */
    public function getQuestionnaire()
    {
        if ($this->questionnaireAbstractQuestion) {
            return $this->questionnaireAbstractQuestion->getQuestionnaire();
        }

        return;
    }

    /**
     * Get question.
     *
     * @return Question
     */
    public function getQuestion()
    {
        if ($this->questionnaireAbstractQuestion) {
            return $this->questionnaireAbstractQuestion->getQuestion();
        }

        return;
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

        $this->getQuestionnaireAbstractQuestion()->getProposalForm()->setUpdatedAt($now);
    }
}
