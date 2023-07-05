<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TitleTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Opinion of experts on a debate.
 *
 * @ORM\Table(name="debate_opinion", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateOpinionRepository")
 * @CapcoAssert\HasAuthor
 */
class DebateOpinion implements Authorable
{
    use AuthorableTrait;
    use BodyUsingJoditWysiwygTrait;
    use DebatableTrait;
    use ForAgainstTrait;
    use TextableTrait;
    use TimestampableTrait;
    use TitleTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    protected ?User $author = null;

    /**
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate", inversedBy="opinions")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $debate;
}
