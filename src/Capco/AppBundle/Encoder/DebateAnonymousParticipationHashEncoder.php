<?php

namespace Capco\AppBundle\Encoder;

use Capco\AppBundle\DTO\DebateAnonymousParticipationHashData;
use Capco\AppBundle\Entity\Interfaces\AnonymousParticipationInterface;

class DebateAnonymousParticipationHashEncoder
{
    public function encode(AnonymousParticipationInterface $participation): string
    {
        return base64_encode(
            sprintf('%s:%s', $participation->getType(), $participation->getToken())
        );
    }

    public function decode(string $hash): DebateAnonymousParticipationHashData
    {
        return DebateAnonymousParticipationHashData::fromHash($hash);
    }
}
