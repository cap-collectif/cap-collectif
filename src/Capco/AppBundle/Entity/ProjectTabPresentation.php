<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ProjectTabType;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="project_tab_presentation")
 */
class ProjectTabPresentation extends ProjectTab
{
    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private ?string $body = null;

    public function getType(): string
    {
        return ProjectTabType::PRESENTATION;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body): self
    {
        $this->body = $body;

        return $this;
    }
}
