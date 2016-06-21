<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\ColorableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Entity\Steps\CollectStep;

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

    // normal constant == default class in bootstrap
    const NORMAL = 'default';
    const PRIMARY = 'primary';
    const SUCCESS = 'success';
    const INFO = 'info';
    const WARNING = 'warning';
    const DANGER = 'danger';

    public static $statuses = [
        'normal' => self::NORMAL,
        'primary' => self::PRIMARY,
        'success' => self::SUCCESS,
        'info' => self::INFO,
        'warning' => self::WARNING,
        'danger' => self::DANGER,
    ];

    public static $statusesLabels = [
        self::NORMAL => 'statuses.labels.normal',
        self::PRIMARY => 'statuses.labels.primary',
        self::SUCCESS => 'statuses.labels.success',
        self::INFO => 'statuses.labels.info',
        self::WARNING => 'statuses.labels.warning',
        self::DANGER => 'statuses.labels.danger',
    ];

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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", inversedBy="statuses", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $step;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="status", cascade={"persist"})
     */
    private $proposals;

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
     *
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

    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * Add proposal.
     *
     * @param Proposal $proposal
     */
    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    /**
     * Remove proposal.
     *
     * @param Proposal $proposal
     */
    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }
}
