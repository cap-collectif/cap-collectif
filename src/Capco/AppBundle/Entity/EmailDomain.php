<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;

/**
 * @ORM\Entity()
 * @ORM\Table(name="email_domain")
 */
class EmailDomain
{
    use UuidTrait;

    /**
     * @ORM\Column(name="value", type="string", nullable=false)
     */
    protected $value;

    public function getValue()
    {
        return $this->value;
    }

    public function setValue(string $value): self
    {
        $this->value = $value;

        return $this;
    }

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\RegistrationForm", inversedBy="domains", cascade={"persist"})
     * @ORM\JoinColumn(name="registration_form_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     **/
    protected $registrationForm;

    public function getRegistrationForm()
    {
        return $this->registrationForm;
    }

    public function setRegistrationForm(RegistrationForm $registrationForm = null)
    {
        $this->registrationForm = $registrationForm;

        return $this;
    }
}
