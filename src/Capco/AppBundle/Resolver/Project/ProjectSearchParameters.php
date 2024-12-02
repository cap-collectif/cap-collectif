<?php

namespace Capco\AppBundle\Resolver\Project;

class ProjectSearchParameters
{
    public function __construct(private int $elements = 0, private int $page = 1, private ?string $term = null, private ?string $type = null, private string $orderBy = 'date', private ?string $theme = null)
    {
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
