<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\PositionableTrait;

/**
 * Class QuestionnaireAbstractQuestion
 * Association between questionnaire and questions.
 *
 * @ORM\Entity()
 * @ORM\Table(name="questionnaire_abstractquestion")
 */
class QuestionnaireAbstractQuestion
{
    use PositionableTrait;

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="questions", cascade={"persist"})
     * @ORM\JoinColumn(name="questionnaire_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     **/
    protected $questionnaire;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="questions", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     **/
    protected $proposalForm;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion", inversedBy="questionnaireAbstractQuestion", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="question_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     **/
    protected $question;

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    public function __toString()
    {
        if ($this->question) {
            return $this->question->__toString();
        }

        return 'undefined question';
    }

    /**
     * Set questionnaire.
     *
     * @param $questionnaire
     *
     * @return QuestionnaireAbstractQuestion
     */
    public function setQuestionnaire(Questionnaire $questionnaire = null)
    {
        $this->questionnaire = $questionnaire;

        return $this;
    }

    /**
     * Get questionnaire.
     *
     * @return Questionnaire
     */
    public function getQuestionnaire()
    {
        return $this->questionnaire;
    }

    /**
     * Set question.
     *
     * @param AbstractQuestion $question
     *
     * @return QuestionnaireAbstractQuestion
     */
    public function setQuestion(AbstractQuestion $question)
    {
        $this->question = $question;

        return $this;
    }

    /**
     * Get question.
     *
     * @return AbstractQuestion
     */
    public function getQuestion()
    {
        return $this->question;
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
}
