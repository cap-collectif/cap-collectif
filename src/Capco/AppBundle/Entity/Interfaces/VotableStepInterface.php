<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface VotableStepInterface
{
    public function isSecretBallot(): bool;

    public function canDisplayBallot(): bool;

    public function isVotable(): bool;

    public function canResolverDisplayBallot($viewer): bool;
}
