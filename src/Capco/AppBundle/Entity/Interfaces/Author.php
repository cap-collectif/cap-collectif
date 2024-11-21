<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\Media;

interface Author
{
    public function getCreatedAt(): ?\DateTimeInterface;

    public function getUsername(): ?string;

    public function getId(): ?string;

    public function getMedia(): ?Media;
}
