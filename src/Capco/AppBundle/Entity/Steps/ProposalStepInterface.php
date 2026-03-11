<?php

namespace Capco\AppBundle\Entity\Steps;

interface ProposalStepInterface
{
    public function getVoteButtonIcon(): string;

    public function setVoteButtonIcon(string $voteButtonIcon): self;

    public function getActionButtonLabel(): string;

    public function setActionButtonLabel(string $actionButtonLabel): self;
}
