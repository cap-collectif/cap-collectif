<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Repository\ReplyRepository;

class ParticipantAccessResolver
{
    public function __construct(private readonly ParticipantHelper $participantHelper, private readonly ReplyRepository $replyRepository)
    {
    }

    /**
     * @return array{'EDIT': bool}
     */
    public function getReplyAccess(string $replyId, string $participantToken): array
    {
        $canEdit = false;
        $participant = $this->participantHelper->getParticipantByToken($participantToken);
        $reply = $this->replyRepository->findOneBy(['id' => $replyId, 'participant' => $participant]);

        if ($reply) {
            $canEdit = true;
        }

        return [
            'EDIT' => $canEdit,
        ];
    }
}
