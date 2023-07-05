<?php

namespace Capco\UserBundle\Security;

class JWT
{
    private array $header;
    private array $payload;
    private ?string $signature;

    public function __construct(string $jwt)
    {
        self::constructFromJWT($jwt);
    }

    public function getHeader(): array
    {
        return $this->header;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }

    public static function getPayloadFromJWT(string $token): ?array
    {
        try {
            return (new self($token))->getPayload();
        } catch (\RuntimeException $exception) {
            return null;
        }
    }

    public function getSignature(): array
    {
        return $this->signature;
    }

    private function constructFromJWT(string $jwt): void
    {
        $split = self::split($jwt);
        $header = self::decode($split['header']);
        $payload = self::decode($split['payload']);
        $signature = $split['signature'];
        if (\is_array($header) && \is_array($payload)) {
            $this->header = $header;
            $this->payload = $payload;
            $this->signature = $signature;
        } else {
            self::throwError($jwt);
        }
    }

    private static function decode(string $encoded): ?array
    {
        return json_decode(base64_decode($encoded), true);
    }

    private static function split(string $jwt): array
    {
        $data = explode('.', $jwt);
        if (3 != \count($data)) {
            self::throwError($jwt);
        }

        return [
            'header' => $data[0],
            'payload' => $data[1],
            'signature' => $data[2],
        ];
    }

    private static function throwError(string $jwt): void
    {
        throw new \RuntimeException('invalid JWT : ' . $jwt);
    }
}
