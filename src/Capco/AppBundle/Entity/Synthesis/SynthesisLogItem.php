<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use JMS\Serializer\Annotation as Serializer;
use JMS\Serializer\Annotation\Expose;
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
     */
    protected $createdAt;

    /**
     * @var SynthesisElement
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", cascade={"persist", "remove"})
     * @Expose
     */
    protected $element;

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
     */
    protected $action;

    function __construct(SynthesisElement $element, User $author, $action)
    {
        $this->element = $element;
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
}
