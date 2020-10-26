<?php

namespace Capco\AppBundle\Entity\Debate;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\TitleTrait;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Traits\HasAuthorTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Capco\AppBundle\Traits\TimestampableTrait;

/**
 * Opinion of experts on a debate.
 *
 * @ORM\Table(name="debate_opinion", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateOpinionRepository")
 */
class DebateOpinion
{
    use UuidTrait;
    use TitleTrait;
    use TextableTrait;
    use ForAgainstTrait;
    use DebatableTrait;
    use HasAuthorTrait;
    use TimestampableTrait;

    public const TYPE_AGAINST = 0;
    public const TYPE_FOR = 1;

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
