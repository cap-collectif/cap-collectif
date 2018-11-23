<?php
namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\SluggableUpdatableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
 *      "section"         = "SectionQuestion",
 * })
 */
abstract class AbstractQuestion implements DisplayableInBOInterface
{
    use TimestampableTrait;
    use SluggableUpdatableTitleTrait;
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
    const QUESTION_TYPE_NUMBER = 9;
    const QUESTION_TYPE_SECTION = 10;

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
        self::QUESTION_TYPE_SECTION => 'section',
        self::QUESTION_TYPE_NUMBER => 'number',
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

    public function __construct()
    {
        $this->jumps = new ArrayCollection();
    }

    /**
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\LogicJump", mappedBy="origin", orphanRemoval=true, cascade={"persist", "remove"})
     */
    protected $jumps;

    /**
     * @Assert\NotNull()
     * @Assert\Range(min=0, max=10)
     * @ORM\Column(name="type", nullable=false)
     */
    protected $type;

    /**
     * @ORM\Column(name="required", type="boolean", nullable=false)
     */
    protected $required = false;

    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    protected $private = false;

    /**
     * @ORM\Column(name="help_text", type="text", nullable=true)
     */
    protected $helpText;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    protected $description;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse", mappedBy="question", cascade={"persist", "remove"})
     */
    protected $responses;

    //field used to the position assignation
    public $temporaryId;

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getTitle();
        }

        return 'New Question';
    }

    /**
     * @return Collection|LogicJump[]
     */
    public function getJumps(): ?Collection
    {
        return $this->jumps;
    }

    public function addJump(LogicJump $jump): self
    {
        if (!$this->jumps->contains($jump)) {
            $this->jumps[] = $jump;
            $jump->setOrigin($this);
        }

        return $this;
    }

    public function removeJump(LogicJump $jump): self
    {
        if ($this->jumps->contains($jump)) {
            $this->jumps->removeElement($jump);
            // set the owning side to null (unless already changed)
            if ($jump->getOrigin() === $this) {
                $jump->setOrigin(null);
            }
        }

        return $this;
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function setHelpText(string $helpText = null): self
    {
        $this->helpText = $helpText;

        return $this;
    }

    public function getHelpText(): ?string
    {
        return $this->helpText;
    }

    public function getResponses(): Collection
    {
        return $this->responses;
    }

    public function setResponses(Collection $responses): self
    {
        $this->responses = $responses;

        return $this;
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

    public function setRequired(bool $required): self
    {
        $this->required = $required;

        return $this;
    }

    public function getQuestionnaireAbstractQuestion(): ?QuestionnaireAbstractQuestion
    {
        return $this->questionnaireAbstractQuestion;
    }

    public function setQuestionnaireAbstractQuestion(
        QuestionnaireAbstractQuestion $questionnaireAbstractQuestion
    ): self {
        $this->questionnaireAbstractQuestion = $questionnaireAbstractQuestion;

        return $this;
    }

    public function isPrivate(): bool
    {
        return $this->private;
    }

    public function setPrivate(bool $private): self
    {
        $this->private = $private;

        return $this;
    }

    public function getType(): ?int
    {
        return $this->type;
    }

    public function setType($type): self
    {
        if (\is_string($type)) {
            return $this->setInputType($type);
        }

        $this->type = $type;

        return $this;
    }

    // ************************* Custom methods *********************

    public function getInputType()
    {
        if (isset(self::$questionTypesInputs[$this->getType()])) {
            return self::$questionTypesInputs[$this->getType()];
        }
    }

    public function setInputType(string $type = null): self
    {
        if (\in_array($type, self::$questionTypesInputs, true)) {
            $this->setType(array_search($type, self::$questionTypesInputs, true));
        }

        return $this;
    }

    public function getPosition(): int
    {
        return $this->questionnaireAbstractQuestion->getPosition();
    }

    public function getQuestionnaire(): ?Questionnaire
    {
        return $this->questionnaireAbstractQuestion->getQuestionnaire();
    }

    public function getQuestion(): ?self
    {
        return $this->questionnaireAbstractQuestion->getQuestion();
    }

    public function getQuestionnaireId(): ?int
    {
        $questionnaire = $this->getQuestionnaire();

        return $questionnaire ? $questionnaire->getId() : null;
    }

    public function getQuestionId(): ?int
    {
        $question = $this->getQuestion();

        return $question ? $question->getId() : null;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function updateTimestamp()
    {
        $now = new \DateTime();

        $this->setUpdatedAt($now);

        if (
            $this->getQuestionnaireAbstractQuestion() &&
            $this->getQuestionnaireAbstractQuestion()->getProposalForm()
        ) {
            $this->getQuestionnaireAbstractQuestion()
                ->getProposalForm()
                ->setUpdatedAt($now);
        }
    }

    public function canDisplayInBo($user = null): bool
    {
        return true;
    }
}
