<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;

class ProposalHelper
{
    protected $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function isAuthor(string $proposalId, User $user): bool
    {
        $proposal = $this->proposalRepository->find($proposalId);

        return $proposal && $proposal->getAuthor() === $user;
    }
}
