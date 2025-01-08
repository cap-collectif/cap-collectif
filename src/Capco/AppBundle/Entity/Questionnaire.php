<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Interfaces\QuestionnableForm;
use Capco\AppBundle\Entity\Interfaces\QuestionsInterface;
use Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\QuestionnaireType;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\DescriptionUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="questionnaire")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionnaireRepository")
 */
class Questionnaire implements DisplayableInBOInterface, QuestionnableForm, Ownerable, CreatableInterface, QuestionsInterface, \Stringable
{
    use CreatableTrait;
    use DescriptionUsingJoditWysiwygTrait;
    use OwnerableTrait;
    use SluggableTitleTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\QuestionnaireStep", inversedBy="questionnaire", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $step;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reply", mappedBy="questionnaire")
     */
    private $replies;

    /**
     * @Assert\Valid
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="questionnaire", cascade={"remove","persist"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $questions;

    /**
     * @var string
     * @ORM\Column(name="theme_help_text", type="string", length=255, nullable=true)
     */
    private $themeHelpText;

    /**
     * @var string
     * @ORM\Column(name="district_help_text", type="string", length=255, nullable=true)
     */
    private $districtHelpText;

    /**
     * @var string
     * @ORM\Column(name="type", type="string", length=255, nullable=false, options={"default" = "QUESTIONNAIRE"})
     */
    private $type = QuestionnaireType::QUESTIONNAIRE;

    /**
     * @var bool
     * @ORM\Column(name="multiple_replies_allowed", type="boolean", nullable=true)
     */
    private $multipleRepliesAllowed = false;

    /**
     * @var bool
     * @ORM\Column(name="anonymous_allowed", type="boolean", nullable=false)
     */
    private $anonymousAllowed = false;

    /**
     * @var bool
     * @ORM\Column(name="acknowledge_replies", type="boolean", nullable=false)
     */
    private $acknowledgeReplies = true;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="evaluationForm", cascade={"persist"})
     */
    private $proposalForm;

    /**
     * @var bool
     * @ORM\Column(name="private_result", type="boolean", nullable=false)
     */
    private $privateResult = true;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration", cascade={"persist", "remove"}, inversedBy="questionnaire")
     * @ORM\JoinColumn(name="notification_configuration_id", referencedColumnName="id", nullable=false)
     */
    private QuestionnaireNotificationConfiguration $notificationsConfiguration;

    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->updatedAt = new \DateTime();
        $this->initializeNotificationConfiguration();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New Questionnaire';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->createdAt = new \DateTime();
            $this->updatedAt = new \DateTime();
            $this->title = sprintf('Copie de %s', $this->title);

            $this->questions = $this->cloneQuestions($this->questions);

            if ($this->notificationsConfiguration) {
                $clonedNotificationConfiguration = clone $this->notificationsConfiguration;
                $clonedNotificationConfiguration->setQuestionnaire($this);
                $this->setNotificationsConfiguration($clonedNotificationConfiguration);
            }
        }
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function isFullyPrivate(): bool
    {
        foreach ($this->getRealQuestions() as $question) {
            if (!$question->isPrivate()) {
                return false;
            }
        }

        return true;
    }

    public function getRealQuestions(): Collection
    {
        $questions = new ArrayCollection();
        /** @var QuestionnaireAbstractQuestion $qaq */
        foreach ($this->questions as $qaq) {
            $questions->add($qaq->getQuestion());
        }

        return $questions;
    }

    public function getQuestions(): Collection
    {
        return $this->questions;
    }

    public function getQuestionsArray(): array
    {
        return $this->questions->toArray();
    }

    /**
     * @return $this
     */
    public function setQuestions(ArrayCollection $questions)
    {
        $this->questions = $questions;

        return $this;
    }

    /**
     * Add question.
     *
     * @return $this
     */
    public function addQuestion(QuestionnaireAbstractQuestion $question)
    {
        if (!$this->questions->contains($question)) {
            $this->questions->add($question);
        }
        $question->setQuestionnaire($this);

        return $this;
    }

    /**
     * Remove question.
     *
     * @return $this
     */
    public function removeQuestion(QuestionnaireAbstractQuestion $question)
    {
        $this->questions->removeElement($question);
        $question->setQuestionnaire(null);

        return $this;
    }

    /**
     * Reset questions.
     *
     * @return $this
     */
    public function resetQuestions()
    {
        $this->questions = new ArrayCollection();

        return $this;
    }

    public function getStep(): ?QuestionnaireStep
    {
        return $this->step;
    }

    /**
     * @param QuestionnaireStep $step
     *
     * @return $this
     */
    public function setStep(?QuestionnaireStep $step = null)
    {
        $this->step = $step;

        return $this;
    }

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     *
     * @param null|mixed $user
     */
    public function canDisplay($user = null): bool
    {
        return $this->getStep() ? $this->getStep()->canDisplay($user) : true;
    }

    public function viewerCanSeeInBo($user = null): bool
    {
        return $this->getStep() ? $this->getStep()->viewerCanSeeInBo($user) : true;
    }

    public function canContribute($viewer = null): bool
    {
        return $this->getStep() && $this->getStep()->canContribute($viewer);
    }

    /**
     * @return string
     */
    public function getThemeHelpText()
    {
        return $this->themeHelpText;
    }

    /**
     * @param string $themeHelpText
     *
     * @return $this
     */
    public function setThemeHelpText($themeHelpText)
    {
        $this->themeHelpText = $themeHelpText;

        return $this;
    }

    /**
     * @return string
     */
    public function getDistrictHelpText()
    {
        return $this->districtHelpText;
    }

    /**
     * @param string $districtHelpText
     *
     * @return $this
     */
    public function setDistrictHelpText($districtHelpText)
    {
        $this->districtHelpText = $districtHelpText;

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getReplies()
    {
        return $this->replies;
    }

    /**
     * @param ArrayCollection $replies
     *
     * @return $this
     */
    public function setReplies($replies)
    {
        $this->replies = $replies;

        return $this;
    }

    /**
     * Add reply.
     *
     * @return $this
     */
    public function addReply(Reply $reply)
    {
        if (!$this->replies->contains($reply)) {
            $this->replies->add($reply);
        }
        $reply->setQuestionnaire($this);

        return $this;
    }

    /**
     * Remove reply.
     *
     * @return $this
     */
    public function removeReply(Reply $reply)
    {
        $this->replies->removeElement($reply);
        $reply->setQuestionnaire(null);

        return $this;
    }

    /**
     * @return bool
     */
    public function isMultipleRepliesAllowed()
    {
        return $this->multipleRepliesAllowed;
    }

    /**
     * @param bool $multipleRepliesAllowed
     *
     * @return $this
     */
    public function setMultipleRepliesAllowed($multipleRepliesAllowed)
    {
        $this->multipleRepliesAllowed = $multipleRepliesAllowed;

        return $this;
    }

    public function isPhoneConfirmationRequired(): bool
    {
        return $this->step && $this->step->isPhoneConfirmationRequired();
    }

    /**
     * @return bool
     */
    public function isAnonymousAllowed()
    {
        return $this->anonymousAllowed;
    }

    /**
     * @param bool $anonymousAllowed
     *
     * @return $this
     */
    public function setAnonymousAllowed($anonymousAllowed)
    {
        $this->anonymousAllowed = $anonymousAllowed;

        return $this;
    }

    /**
     * @return bool
     */
    public function isAcknowledgeReplies()
    {
        return $this->acknowledgeReplies;
    }

    /**
     * @param bool $acknowledgeReplies
     *
     * @return $this
     */
    public function setAcknowledgeReplies($acknowledgeReplies)
    {
        $this->acknowledgeReplies = $acknowledgeReplies;

        return $this;
    }

    public function getProposalForm(): ?ProposalForm
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm): self
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function isPrivateResult(): bool
    {
        return $this->privateResult;
    }

    public function setPrivateResult(bool $privateResult): self
    {
        $this->privateResult = $privateResult;

        return $this;
    }

    public function isNotifyResponseCreate(): bool
    {
        return $this->notificationsConfiguration->isOnQuestionnaireReplyCreate();
    }

    public function isNotifyResponseUpdate(): bool
    {
        return $this->notificationsConfiguration->isOnQuestionnaireReplyUpdate();
    }

    public function isNotifyResponseDelete(): bool
    {
        return $this->notificationsConfiguration->isOnQuestionnaireReplyDelete();
    }

    public function getNotificationsConfiguration(): QuestionnaireNotificationConfiguration
    {
        return $this->notificationsConfiguration;
    }

    public function setNotificationsConfiguration(
        QuestionnaireNotificationConfiguration $notificationsConfiguration
    ): self {
        $this->notificationsConfiguration = $notificationsConfiguration;
        $notificationsConfiguration->setQuestionnaire($this);

        return $this;
    }

    public function initializeNotificationConfiguration(): void
    {
        $questionnaireNotificationConfiguration = new QuestionnaireNotificationConfiguration();
        $questionnaireNotificationConfiguration->setQuestionnaire($this);
        $questionnaireNotificationConfiguration->setOnQuestionnaireReplyDelete(false);
        $questionnaireNotificationConfiguration->setOnQuestionnaireReplyCreate(false);
        $questionnaireNotificationConfiguration->setOnQuestionnaireReplyUpdate(false);

        $this->notificationsConfiguration = $questionnaireNotificationConfiguration;
    }

    private function getCloneQuestionReference(
        array &$cloneReferences,
        QuestionnaireAbstractQuestion $qaq
    ): QuestionnaireAbstractQuestion {
        $key = $qaq->getQuestion()->getTitle() . $qaq->getQuestion()->getPosition();
        if (\array_key_exists($key, $cloneReferences)) {
            return $cloneReferences[$key];
        }

        $clonedAbstractQaq = clone $qaq;
        $clonedAbstractQaq->setQuestionnaire($this);
        $cloneReferences[$key] = $clonedAbstractQaq;

        return $clonedAbstractQaq;
    }

    private function findChoiceByTitle(array $array, string $title)
    {
        foreach ($array as $element) {
            if ($title === $element->getTitle()) {
                return $element;
            }
        }

        return null;
    }

    /**
     * @param Collection<int, QuestionnaireAbstractQuestion> $questions
     *
     * @return ArrayCollection<int, QuestionnaireAbstractQuestion>
     */
    private function cloneQuestions(Collection $questions): ArrayCollection
    {
        $questionsClone = new ArrayCollection();
        $cloneReferences = [];

        foreach ($questions as $question) {
            $clonedQuestion = $this->getCloneQuestionReference($cloneReferences, $question);

            /** @var AbstractQuestion $question */
            $question = $clonedQuestion->getQuestion();

            if ($question instanceof MultipleChoiceQuestion && !empty($question->getJumps())) {
                $this->cloneJumps($question, $cloneReferences);
            }

            $questionsClone->add($clonedQuestion);
        }

        return $questionsClone;
    }

    /**
     * @param array<string, QuestionnaireAbstractQuestion> $cloneReferences
     */
    private function cloneJumps(AbstractQuestion $question, array &$cloneReferences): void
    {
        /** @var LogicJump $jump */
        foreach ($question->getJumps() as $jump) {
            $clonedJump = clone $jump;

            $originQuestion = $jump->getOrigin()->getQuestionnaireAbstractQuestion();
            $destinationQuestion = $jump->getDestination()->getQuestionnaireAbstractQuestion();

            $clonedJump->setOrigin(
                $this->getCloneQuestionReference($cloneReferences, $originQuestion)->getQuestion()
            );
            $clonedJump->setDestination(
                $this->getCloneQuestionReference($cloneReferences, $destinationQuestion)->getQuestion()
            );

            $this->cloneConditions($clonedJump, $question);

            $question->addJump($clonedJump);
        }
    }

    private function cloneConditions(LogicJump $clonedJump, AbstractQuestion $question): void
    {
        foreach ($clonedJump->getConditions() as $condition) {
            $clonedCondition = clone $condition;
            $clonedCondition->setQuestion($question);
            $clonedCondition->setJump($clonedJump);

            $clonedCondition->setValue($this->findChoiceByTitle($question->getChoices()->toArray(), $condition->getValue()->getTitle()));
            $clonedJump->addCondition($clonedCondition);
        }
    }
}
