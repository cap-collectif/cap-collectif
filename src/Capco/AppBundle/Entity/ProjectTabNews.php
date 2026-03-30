<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ProjectTabType;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="project_tab_news")
 */
class ProjectTabNews extends ProjectTab
{
    /**
     * @ORM\OneToMany(
     *     targetEntity="Capco\AppBundle\Entity\ProjectTabNewsItem",
     *     mappedBy="projectTab",
     *     cascade={"persist", "remove"},
     *     orphanRemoval=true
     * )
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private Collection $newsItems;

    public function __construct()
    {
        $this->newsItems = new ArrayCollection();
    }

    public function getType(): string
    {
        return ProjectTabType::NEWS;
    }

    public function getNewsItems(): Collection
    {
        return $this->newsItems;
    }

    /**
     * @return array<Post>
     */
    public function getNews(): array
    {
        $news = [];
        foreach ($this->newsItems as $newsItem) {
            $post = $newsItem->getPost();
            if (!$post instanceof Post) {
                continue;
            }

            $news[] = $post;
        }

        return $news;
    }

    public function addNewsItem(ProjectTabNewsItem $newsItem): self
    {
        $newsItem->setProjectTab($this);

        if (!$this->newsItems->contains($newsItem)) {
            $this->newsItems->add($newsItem);
        }

        return $this;
    }

    public function removeNewsItem(ProjectTabNewsItem $newsItem): self
    {
        $this->newsItems->removeElement($newsItem);

        return $this;
    }
}
