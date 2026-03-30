<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *     name="project_tab_news_item",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(name="project_tab_news_item_unique", columns={"project_tab_id", "post_id"})
 *     }
 * )
 */
class ProjectTabNewsItem implements EntityInterface
{
    use PositionableTrait;
    use UuidTrait;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProjectTabNews", inversedBy="newsItems", cascade={"persist"})
     * @ORM\JoinColumn(name="project_tab_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private ?ProjectTabNews $projectTab = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Post", cascade={"persist"})
     * @ORM\JoinColumn(name="post_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private ?Post $post = null;

    public function getProjectTab(): ?ProjectTabNews
    {
        return $this->projectTab;
    }

    public function setProjectTab(ProjectTabNews $projectTab): self
    {
        $this->projectTab = $projectTab;

        return $this;
    }

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(Post $post): self
    {
        $this->post = $post;

        return $this;
    }
}
