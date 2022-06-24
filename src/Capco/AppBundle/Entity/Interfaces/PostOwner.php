<?php

namespace Capco\AppBundle\Entity\Interfaces;

/**
 * When we access a post owner (e.g post { owner { ... } }, we only expose a subset of fields
 * of a user that are relevant).
 */
interface PostOwner extends Owner
{
    public function getId(): ?string;

    public function getUsername(): ?string;
}
