<?php

namespace Model;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Consultation
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Repository\ConsultationRepository")
 */
class Consultation
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=100)
     */
    private $title;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="opened_at", type="datetime")
     */
    private $openedAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="closed_at", type="datetime")
     */
    private $closeddAt;

    /**
     * @var integer
     *
     * @ORM\Column(name="opinion_count", type="integer")
     */
    private $opinionCount;

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
     * Set title
     *
     * @param string $title
     * @return Consultation
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @return \DateTime
     */
    public function getCloseddAt()
    {
        return $this->closeddAt;
    }

    /**
     * @param \DateTime $closeddAt
     */
    public function setCloseddAt($closeddAt)
    {
        $this->closeddAt = $closeddAt;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getOpenedAt()
    {
        return $this->openedAt;
    }

    /**
     * @param \DateTime $openedAt
     */
    public function setOpenedAt($openedAt)
    {
        $this->openedAt = $openedAt;
    }

    /**
     * @return int
     */
    public function getOpinionCount()
    {
        return $this->opinionCount;
    }

    /**
     * @param int $opinionCount
     */
    public function setOpinionCount($opinionCount)
    {
        $this->opinionCount = $opinionCount;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

}
