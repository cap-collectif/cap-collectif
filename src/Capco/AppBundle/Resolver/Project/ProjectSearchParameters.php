<?php

namespace Capco\AppBundle\Resolver\Project;

class ProjectSearchParameters
{
    private $elements = 0;
    private $page = 1;
    private $term;
    private $type;
    private $orderBy;
    private $theme;

    public function __construct(
        int $elements = 0,
        int $page = 1,
        ?string $term = null,
        ?string $type = null,
        string $orderBy = 'date',
        ?string $theme = null
    ) {
        $this->elements = $elements;
        $this->page = $page;
        $this->term = $term;
        $this->type = $type;
        $this->orderBy = $orderBy;
        $this->theme = $theme;
    }

    public function setTerm(?string $term = null): self
    {
        $this->term = $term;

        return $this;
    }

    public function setType(?string $type = null)
    {
        $this->type = $type;

        return $this;
    }

    public function setOrderBy(string $orderBy = 'date'): self
    {
        $this->orderBy = $orderBy;

        return $this;
    }

    public function setTheme(?string $theme = null): self
    {
        $this->theme = $theme;

        return $this;
    }

    public function setElements(int $elements): self
    {
        $this->elements = $elements;

        return $this;
    }

    public function setPage(int $page): self
    {
        $this->page = $page;

        return $this;
    }

    public function getElements(): int
    {
        return $this->elements;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function toArray(): array
    {
        return [
            $this->elements,
            $this->page,
            $this->theme,
            $this->orderBy,
            $this->term,
            $this->type,
        ];
    }
}
