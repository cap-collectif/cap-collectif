<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="requirement")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\RequirementRepository")
 */
class Requirement implements EntityInterface
{
    use PositionableTrait;
    use UuidTrait;

    final public const CHECKBOX = 'CHECKBOX';
    final public const FIRSTNAME = 'FIRSTNAME';
    final public const LASTNAME = 'LASTNAME';
    final public const PHONE = 'PHONE';
    final public const DATE_OF_BIRTH = 'DATE_OF_BIRTH';
    final public const POSTAL_ADDRESS = 'POSTAL_ADDRESS';
    final public const IDENTIFICATION_CODE = 'IDENTIFICATION_CODE';
    final public const PHONE_VERIFIED = 'PHONE_VERIFIED';
    final public const FRANCE_CONNECT = 'FRANCE_CONNECT';

    public static array $types = [
        self::CHECKBOX,
        self::FIRSTNAME,
        self::LASTNAME,
        self::PHONE,
        self::DATE_OF_BIRTH,
        self::POSTAL_ADDRESS,
        self::IDENTIFICATION_CODE,
        self::PHONE_VERIFIED,
        self::FRANCE_CONNECT,
    ];

    public static array $requirementsLabels = [
        self::CHECKBOX => 'check-box',
        self::FIRSTNAME => 'form.label_firstname',
        self::LASTNAME => 'group.title',
        self::PHONE => 'mobile-phone',
        self::DATE_OF_BIRTH => 'form.label_date_of_birth',
        self::POSTAL_ADDRESS => 'admin.fields.event.address',
        self::IDENTIFICATION_CODE => 'identification_code',
        self::PHONE_VERIFIED => 'verify.number.sms',
        self::FRANCE_CONNECT => 'france_connect',
    ];

    /**
     * @ORM\Column(name="type", type="string")
     * @Assert\NotNull()
     */
    private ?string $type = self::CHECKBOX;

    /**
     * @ORM\Column(name="label", type="string", nullable=true)
     */
    private ?string $label = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep", inversedBy="requirements")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=false)
     */
    private AbstractStep $step;

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getStep(): AbstractStep
    {
        return $this->step;
    }

    public function setStep(AbstractStep $step): self
    {
        $this->step = $step;

        return $this;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label = null): self
    {
        $this->label = $label;

        return $this;
    }
}
