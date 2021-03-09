<?php


namespace Capco\AppBundle\DTO;


use Capco\AppBundle\Enum\ForOrAgainstType;

class DebateAnonymousVoteEncoderData
{
    private string $type;

    private string $token;

    private function __construct(string $type, string $token)
    {
        ForOrAgainstType::checkIsValid($type);
        $this->type= $type;
        $this->token = $token;
    }

    public static function fromHash(string $hash): self
    {
        $decoded = base64_decode($hash);
        list($type, $token) = explode(':', $decoded);

        return new self($type, $token);
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
