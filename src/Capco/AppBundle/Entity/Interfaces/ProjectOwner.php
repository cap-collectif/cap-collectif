<?php

namespace Capco\AppBundle\Entity\Interfaces;

/**
 * When we access a project owner (e.g project { owner { ... } }, we only expose a subset of fields
 * of a user that are relevant).
 */
interface ProjectOwner extends Owner
{
    public function getId(): ?string;

    public function getUsername(): ?string;
}
