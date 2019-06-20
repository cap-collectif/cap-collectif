<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class QuestionnaireStep.
 *
 * @ORM\Table(name="questionnaire_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionnaireStepRepository")
 */
class QuestionnaireStep extends AbstractStep implements ParticipativeStepInterface
{
    use TimelessStepTrait;

    const VERIFICATION_NONE = 'none';
    const VERIFICATION_SMS = 'sms';
    public static $verificationLabels = [
        'step.verification.none' => self::VERIFICATION_NONE,
        'step.verification.sms' => self::VERIFICATION_SMS
    ];

    /**
     * @ORM\Column(type="string", columnDefinition="ENUM('none', 'sms')")
     * @Assert\Choice(choices = {"none", "sms"})
     */
    private $verification = 'none';

    /**
     * TODO: remove this.
     *
     * @ORM\Column(name="replies_count", type="integer")
     */
    private $repliesCount = 0;

    /**
     * @var Questionnaire
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", mappedBy="step", cascade={"persist"})
     */
    private $questionnaire;

    /**
     * @ORM\Column(name="footer", type="text", nullable=true)
     */
    private $footer;

    public function getFooter()
    {
        return $this->footer;
    }

    public function setFooter(string $footer = null)
    {
        $this->footer = $footer;

        return $this;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return 'questionnaire';
    }

    public function isQuestionnaireStep(): bool
    {
        return true;
    }

    public function getRepliesCount(): int
    {
        // Column in database is nullable because of single-table inheritance
        return $this->repliesCount ?? 0;
    }

    public function setVerification($verification)
    {
        $this->verification = $verification;

        return $this;
    }

    public function getVerification()
    {
        return $this->verification;
    }

    public function setRepliesCount(int $repliesCount): self
    {
        $this->repliesCount = $repliesCount;

        return $this;
    }

    /**
     * @return Questionnaire
     */
    public function getQuestionnaire()
    {
        return $this->questionnaire;
    }

    public function isPhoneConfirmationRequired()
    {
        return self::VERIFICATION_SMS === $this->verification;
    }

    /**
     * @param Questionnaire $questionnaire
     *
     * @return QuestionnaireStep
     */
    public function setQuestionnaire(Questionnaire $questionnaire = null)
    {
        if ($questionnaire) {
            $questionnaire->setStep($this);
        } elseif ($this->questionnaire) {
            $this->questionnaire->setStep(null);
        }
        $this->questionnaire = $questionnaire;

        return $this;
    }

    public function isParticipative(): bool
    {
        return true;
    }
}
