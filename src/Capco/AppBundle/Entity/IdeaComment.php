<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class IdeaComment.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\IdeaCommentRepository")
 */
class IdeaComment extends Comment
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Idea", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id", onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private $Idea;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return mixed
     */
    public function getIdea()
    {
        return $this->Idea;
    }

    /**
     * @param $Idea
     *
     * @return $this
     */
    public function setIdea($Idea)
    {
        $this->Idea = $Idea;
        $Idea->addComment($this);

        return $this;
    }

    // ************************ Overriden methods *********************************

    public function getRelatedObject()
    {
        return $this->getIdea();
    }

    /**
     * @param $object
     *
     * @return mixed
     */
    public function setRelatedObject($object)
    {
        return $this->setIdea($object);
    }
}
