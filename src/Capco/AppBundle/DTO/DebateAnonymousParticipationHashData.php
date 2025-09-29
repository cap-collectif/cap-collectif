<?php

namespace Capco\AppBundle\DTO;

use Capco\AppBundle\Enum\ForOrAgainstType;

class DebateAnonymousParticipationHashData
{
    private readonly string $type;

    private function __construct(
        string $type,
        private readonly string $token
    ) {
        ForOrAgainstType::checkIsValid($type);
        $this->type = $type;
    }

    public static function fromHash(string $hash): self
    {
        $decoded = base64_decode($hash);
        $data = explode(':', $decoded);

        return new self($data[0], $data[1] ?? '');
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getType(): string
    {
        return $this->type;
    }
}
