<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface Author
{
    public function getCreatedAt(): ?\DateTimeInterface;

    public function getUsername(): ?string;

    public function getId(): ?string;
}
