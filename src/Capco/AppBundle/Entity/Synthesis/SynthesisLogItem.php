<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use JMS\Serializer\Annotation as Serializer;
use JMS\Serializer\Annotation\Expose;
use JMS\Serializer\Annotation\Groups;
use JMS\Serializer\Annotation\VirtualProperty;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * SynthesisLogItem
 *
 * @ORM\Table(name="synthesis_log_items")
 * @ORM\Entity()
 * @Serializer\ExclusionPolicy("all")
 */
class SynthesisLogItem
{

    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     * @Expose
     */
    protected $id;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     * @Expose
     */
    protected $createdAt;

    /**
     * @var string
     * @ORM\Column(name="element_id", type="string")
     * @Expose
     */
    protected $elementId;

    /**
     * @var string
     * @ORM\Column(name="element_title", type="string")
     * @Expose
     */
    protected $elementTitle;

    /**
     * @var User
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", cascade={"persist", "remove"})
     * @Expose
     */
    protected $author;

    /**
     * @var
     *
     * @ORM\Column(name="action", type="string", length=255)
     * @Expose
     */
    protected $action;

    function __construct(SynthesisElement $element, User $author, $action)
    {
        $this->elementId = $element->getId();
        $this->elementTitle = $element->getTitle();
        $this->author = $author;
        $this->action = $action;
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return string
     */
    public function getElementId()
    {
        return $this->elementId;
    }

    /**
     * @param string $elementId
     */
    public function setElementId($elementId)
    {
        $this->elementId = $elementId;
    }

    /**
     * @return mixed
     */
    public function getElementTitle()
    {
        return $this->elementTitle;
    }

    /**
     * @param mixed $elementTitle
     */
    public function setElementTitle($elementTitle)
    {
        $this->elementTitle = $elementTitle;
    }

    /**
     * @return User
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param User $author
     */
    public function setAuthor($author)
    {
        $this->author = $author;
    }

    /**
     * @return mixed
     */
    public function getAction()
    {
        return $this->action;
    }

    /**
     * @param mixed $action
     */
    public function setAction($action)
    {
        $this->action = $action;
    }
}
