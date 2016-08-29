<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * @ORM\Table(name="progress_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProgressStepRepository")
 * @Serializer\ExclusionPolicy("all")
 */
class ProgressStep
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="title", type="string", nullable=false)
     */
    private $title;

    /**
     * @ORM\Column(name="start_at", type="datetime", nullable=false)
     */
    private $startAt;

    /**
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="progressSteps", cascade={"persist"})
     */
    private $proposal;

    public function __construct()
    {
        $this->startAt = new \DateTime();
    }

    public function getStatus() : string
    {
        return 'en cours';
    }

    public function getId() : int
    {
        return $this->id;
    }

    public function setId(int $id) : self
    {
        $this->id = $id;

        return $this;
    }

    public function getTitle() : string
    {
        return $this->title ?? '';
    }

    public function setTitle($title) : self
    {
        $this->title = $title;

        return $this;
    }

    public function getStartAt() : \DateTime
    {
        return $this->startAt;
    }

    public function setStartAt($startAt) : self
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt()
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTime $endAt = null) : self
    {
        $this->endAt = $endAt;

        return $this;
    }
}
