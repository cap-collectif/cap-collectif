<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;

/**
 * @ORM\Table(name="contact_form")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ContactFormRepository")
 */
class ContactForm
{
    use UuidTrait;
    use SluggableTitleTrait;
    use TextableTrait;

    /**
     * @ORM\Column(name="email", type="string", length=255, nullable=false)
     */
    private $email;

    /**
     * @ORM\Column(name="interlocutor", type="string", length=255, nullable=false)
     */
    private $interlocutor;
    /**
     * @ORM\Column(name="confidentiality", type="string", nullable=false)
     */
    private $confidentiality;

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getInterlocutor(): ?string
    {
        return $this->interlocutor;
    }

    public function setInterlocutor(string $interlocutor): self
    {
        $this->interlocutor = $interlocutor;

        return $this;
    }

    public function getConfidentiality(): string
    {
        return $this->confidentiality;
    }

    public function setConfidentiality(string $confidentiality): self
    {
        $this->confidentiality = $confidentiality;

        return $this;
    }
}
