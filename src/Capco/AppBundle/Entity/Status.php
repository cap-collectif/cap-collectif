<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\ColorableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * Status.
 *
 * @ORM\Table(name="status")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\StatusRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Status
{
    use TimestampableTrait;
    use PositionableTrait;
    use ColorableTrait;

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string")
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\CollectStep", inversedBy="statuses", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $step;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getName();
        }
        return 'New status';
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    public function getStep()
    {
        return $this->step;
    }

    public function setStep(CollectStep $step)
    {
        $this->step = $step;

        return $this;
    }

}
