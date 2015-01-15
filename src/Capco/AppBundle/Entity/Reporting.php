<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Reporting
 *
 * @ORM\Table(name="reporting")
 * @ORM\Entity
 */
class Reporting
{
    const SIGNALEMENT_SEX = 0;
    const SIGNALEMENT_OFF = 1;
    const SIGNALEMENT_SPAM = 2;
    const SIGNALEMENT_ERROR = 3;
    const SIGNALEMENT_OFF_TOPIC = 4;

    public static $openingStatusesLabels = [
        self::SIGNALEMENT_SEX => 'Contenu à caractère sexuel',
        self::SIGNALEMENT_OFF => 'Contenu raciste, offensant ou haineux',
        self::SIGNALEMENT_SPAM => 'Spam ou contenu trompeur',
        self::SIGNALEMENT_ERROR => 'Information erronée',
        self::SIGNALEMENT_OFF_TOPIC => 'Propos hors-sujet',
    ];

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var integer
     *
     * @ORM\Column(name="status", type="integer")
     */
    private $status;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"status", "body", "Reporter", "Opinion", "Source", "Argument", "Idea"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="reporter_id", referencedColumnName="id")
     */
    private $Reporter;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Reports")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id")
     */
    private $Opinion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="Reports")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id")
     */
    private $Source;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Reports")
     * @ORM\JoinColumn(name="argument_id", referencedColumnName="id")
     */
    private $Argument;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="Reports")
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id")
     */
    private $Idea;

    function __construct()
    {
        $this->updatedAt = new \Datetime;
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set status
     *
     * @param integer $status
     * @return Reporting
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return integer
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param string $body
     */
    public function setBody($body)
    {
        $this->body = $body;
    }

    /**
     * @return mixed
     */
    public function getReporter()
    {
        return $this->Reporter;
    }

    /**
     * @param mixed $reporter
     */
    public function setReporter($reporter)
    {
        $this->Reporter = $reporter;
    }

    /**
     * @return mixed
     */
    public function getOpinion()
    {
        return $this->Opinion;
    }

    /**
     * @param mixed $Opinion
     */
    public function setOpinion($Opinion)
    {
        $this->Opinion = $Opinion;
    }

    /**
     * @return mixed
     */
    public function getSource()
    {
        return $this->Source;
    }

    /**
     * @param mixed $Source
     */
    public function setSource($Source)
    {
        $this->Source = $Source;
    }

    /**
     * @return mixed
     */
    public function getArgument()
    {
        return $this->Argument;
    }

    /**
     * @param mixed $Argument
     */
    public function setArgument($Argument)
    {
        $this->Argument = $Argument;
    }

    /**
     * @return mixed
     */
    public function getIdea()
    {
        return $this->Idea;
    }

    /**
     * @param mixed $Idea
     */
    public function setIdea($Idea)
    {
        $this->Idea = $Idea;
    }

}
