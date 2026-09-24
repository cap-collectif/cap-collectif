<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Reply;

class ParticipantAccessResolver
{
    public function __construct(
        private readonly ParticipantHelper $participantHelper,
        private readonly CapcoAnonReplyDecoder $capcoAnonReplyDecoder
    ) {
    }

    public function canViewReplyFromCookie(Reply $reply, ?string $cookie): bool
    {
        if (!$cookie || !$reply->getQuestionnaire()) {
            return false;
        }

        try {
            $replies = $this->capcoAnonReplyDecoder->decode($cookie)[$reply->getQuestionnaire()->getId()] ?? [];
            foreach ($replies as $replyAccess) {
                if ($replyAccess['replyId'] === $reply->getId()) {
                    $participant = $this->participantHelper->getParticipantByToken($replyAccess['token']);

                    return $reply->getParticipant()?->getId() === $participant->getId();
                }
            }
        } catch (\Throwable) {
        }

        return false;
    }
}
