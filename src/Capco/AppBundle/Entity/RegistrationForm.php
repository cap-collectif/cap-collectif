<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\QuestionnableForm;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="registration_form")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\RegistrationFormRepository")
 */
class RegistrationForm implements EntityInterface, QuestionnableForm, TranslatableInterface
{
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="registrationForm", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $questions;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\EmailDomain", mappedBy="registrationForm", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $domains;

    /**
     * @ORM\Column(name="bottom_text_displayed", type="boolean", nullable=false)
     */
    private $bottomTextDisplayed = false;

    /**
     * @ORM\Column(name="top_text_displayed", type="boolean", nullable=false)
     */
    private $topTextDisplayed = false;

    /**
     * @ORM\Column(name="top_text_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    private bool $topTextUsingJoditWysiwyg = false;

    /**
     * @ORM\Column(name="bottom_text_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    private bool $bottomTextUsingJoditWysiwyg = false;

    public function __construct()
    {
        $this->questions = new ArrayCollection();
    }

    public function isTopTextUsingJoditWysiwyg(): bool
    {
        return $this->topTextUsingJoditWysiwyg;
    }

    public function setTopTextUsingJoditWysiwyg(bool $topTextUsingJoditWysiwyg): self
    {
        $this->topTextUsingJoditWysiwyg = $topTextUsingJoditWysiwyg;

        return $this;
    }

    public function isBottomTextUsingJoditWysiwyg(): bool
    {
        return $this->bottomTextUsingJoditWysiwyg;
    }

    public function setBottomTextUsingJoditWysiwyg(bool $bottomTextUsingJoditWysiwyg): self
    {
        $this->bottomTextUsingJoditWysiwyg = $bottomTextUsingJoditWysiwyg;

        return $this;
    }

    public function isBottomTextDisplayed(): bool
    {
        return $this->bottomTextDisplayed;
    }

    public function setBottomTextDisplayed(bool $bottomTextDisplayed): self
    {
        $this->bottomTextDisplayed = $bottomTextDisplayed;

        return $this;
    }

    public function isTopTextDisplayed(): bool
    {
        return $this->topTextDisplayed;
    }

    public function setTopTextDisplayed(bool $topTextDisplayed): self
    {
        $this->topTextDisplayed = $topTextDisplayed;

        return $this;
    }

    public function setTopText(?string $topText = null): self
    {
        $this->translate(null, false)->setTopText($topText);

        return $this;
    }

    public function getTopText(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTopText();
    }

    public function setBottomText(?string $bottomText = null): self
    {
        $this->translate(null, false)->setBottomText($bottomText);

        return $this;
    }

    public function getBottomText(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBottomText();
    }

    public function getRealQuestions(): Collection
    {
        $questions = new ArrayCollection();
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

    public function setQuestions(Collection $questions): self
    {
        foreach ($questions as $question) {
            $question->setRegistrationForm($this);
        }
        $this->questions = $questions;

        return $this;
    }

    public function addQuestion(QuestionnaireAbstractQuestion $question): self
    {
        if (!$this->questions->contains($question)) {
            $this->questions->add($question);
        }
        $question->setRegistrationForm($this);

        return $this;
    }

    public function removeQuestion(QuestionnaireAbstractQuestion $question): self
    {
        $this->questions->removeElement($question);
        $question->setRegistrationForm(null);

        return $this;
    }

    public function getDomains(): Collection
    {
        return $this->domains;
    }

    public function resetDomains(): self
    {
        foreach ($this->domains as $domain) {
            $domain->setRegistrationForm(null);
        }
        $this->domains = new ArrayCollection();

        return $this;
    }

    public function addDomain(EmailDomain $domain): self
    {
        if (!$this->domains->contains($domain)) {
            $this->domains->add($domain);
        }
        $domain->setRegistrationForm($this);

        return $this;
    }

    public function removeDomain(EmailDomain $domain): self
    {
        $this->domains->removeElement($domain);
        $domain->setRegistrationForm(null);

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return RegistrationFormTranslation::class;
    }
}
