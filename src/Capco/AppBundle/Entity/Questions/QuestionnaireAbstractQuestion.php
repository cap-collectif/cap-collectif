<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\RegistrationForm;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Association between questionnaire and questions.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository")
 * @ORM\Table(
 *  name="questionnaire_abstractquestion",
 *  uniqueConstraints={
 *     @ORM\UniqueConstraint(
 *        name="questionnaire_position_unique",
 *        columns={"questionnaire_id", "position"}
 *     ),
 *     @ORM\UniqueConstraint(
 *        name="proposal_form_position_unique",
 *        columns={"proposal_form_id", "position"}
 *     ),
 *     @ORM\UniqueConstraint(
 *        name="registration_form_position_unique",
 *        columns={"registration_form_id", "position"}
 *     )
 *   }
 * )
 */
class QuestionnaireAbstractQuestion
{
    use IdTrait;
    use PositionableTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="questions", cascade={"persist"})
     * @ORM\JoinColumn(name="questionnaire_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    protected $questionnaire;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="questions", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    protected $proposalForm;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\RegistrationForm", inversedBy="questions", cascade={"persist"})
     * @ORM\JoinColumn(name="registration_form_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    protected $registrationForm;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion", inversedBy="questionnaireAbstractQuestion", cascade={"remove", "persist"})
     * @ORM\JoinColumn(name="question_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     */
    protected $question;

    public function __toString()
    {
        if ($this->question) {
            return $this->question->__toString();
        }

        return 'undefined question';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $clonedQuestion = clone $this->question;
            $this->setQuestion($clonedQuestion);
        }
    }

    public function setQuestionnaire(?Questionnaire $questionnaire = null): self
    {
        $this->questionnaire = $questionnaire;

        return $this;
    }

    public function getQuestionnaire(): ?Questionnaire
    {
        return $this->questionnaire;
    }

    public function setQuestion(AbstractQuestion $question): self
    {
        $question->setQuestionnaireAbstractQuestion($this);
        $this->question = $question;

        return $this;
    }

    public function getQuestion(): ?AbstractQuestion
    {
        return $this->question;
    }

    public function getProposalForm(): ?ProposalForm
    {
        return $this->proposalForm;
    }

    public function setProposalForm(?ProposalForm $proposalForm = null): self
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function getRegistrationForm(): ?RegistrationForm
    {
        return $this->registrationForm;
    }

    public function setRegistrationForm(?RegistrationForm $registrationForm = null): self
    {
        $this->registrationForm = $registrationForm;

        return $this;
    }
}
