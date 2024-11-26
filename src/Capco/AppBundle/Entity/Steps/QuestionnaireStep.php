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

    final public const TYPE = 'questionnaire';
    final public const VERIFICATION_NONE = 'none';
    final public const VERIFICATION_SMS = 'sms';
    public static $verificationLabels = [
        'step.verification.none' => self::VERIFICATION_NONE,
        'step.verification.sms' => self::VERIFICATION_SMS,
    ];

    /**
     * @ORM\Column(type="string", columnDefinition="ENUM('none', 'sms')")
     * @Assert\Choice(choices = {"none", "sms"})
     */
    private $verification = 'none';

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", mappedBy="step", cascade={"persist"})
     */
    private ?Questionnaire $questionnaire;

    /**
     * @ORM\Column(name="is_anonymous_participation_allowed", type="boolean", nullable=false, options={"default" = false})
     */
    private bool $isAnonymousParticipationAllowed = false;

    /**
     * @ORM\Column(name="collect_participants_email", type="boolean", nullable=false, options={"default" = false})
     */
    private bool $collectParticipantsEmail = false;

    /**
     * @ORM\Column(name="footer", type="text", nullable=true)
     */
    private $footer;

    /**
     * @ORM\Column(name="footer_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    private bool $footerUsingJoditWysiwyg = false;

    public function __clone()
    {
        parent::__clone();
        $this->questionnaire = clone $this->questionnaire;
        $this->questionnaire->setTitle('Copie de ' . $this->questionnaire->getTitle());
        $this->questionnaire->setStep($this);
    }

    public function isFooterUsingJoditWysiwyg(): bool
    {
        return $this->footerUsingJoditWysiwyg;
    }

    public function setFooterUsingJoditWysiwyg(bool $footerUsingJoditWysiwyg): self
    {
        $this->footerUsingJoditWysiwyg = $footerUsingJoditWysiwyg;

        return $this;
    }

    public function getFooter()
    {
        return $this->footer;
    }

    public function setFooter(?string $footer = null)
    {
        $this->footer = $footer;

        return $this;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return self::TYPE;
    }

    public function isQuestionnaireStep(): bool
    {
        return true;
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

    public function getQuestionnaire(): ?Questionnaire
    {
        return $this->questionnaire;
    }

    public function isPhoneConfirmationRequired()
    {
        return self::VERIFICATION_SMS === $this->verification;
    }

    public function setQuestionnaire(?Questionnaire $questionnaire = null): self
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

    //used in twig to add googlemaps js file
    public function useAddressOrMap(): bool
    {
        return true;
    }

    public function isAnonymousParticipationAllowed(): bool
    {
        return $this->isAnonymousParticipationAllowed;
    }

    public function setIsAnonymousParticipationAllowed(bool $isAnonymousParticipationAllowed): self
    {
        $this->isAnonymousParticipationAllowed = $isAnonymousParticipationAllowed;

        return $this;
    }

    public function isCollectParticipantsEmail(): bool
    {
        return $this->collectParticipantsEmail;
    }

    public function setCollectParticipantsEmail(bool $collectParticipantsEmail): self
    {
        $this->collectParticipantsEmail = $collectParticipantsEmail;

        return $this;
    }
}
