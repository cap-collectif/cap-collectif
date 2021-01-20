<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait AllowAuthorsToAddNewsTrait
{
    /**
     * @ORM\Column(name="allow_authors_to_add_news", type="boolean", nullable=false, options={"default" = false})
     */
    protected bool $allowAuthorsToAddNews = false;

    public function isAllowAuthorsToAddNews(): bool
    {
        return $this->allowAuthorsToAddNews;
    }

    public function setAllowAuthorsToAddNews(bool $allowAuthorsToAddNews): self
    {
        $this->allowAuthorsToAddNews = $allowAuthorsToAddNews;

        return $this;
    }
}
