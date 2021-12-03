<?php

namespace Capco\AppBundle\Generator;

class IdentificationCodeGenerator
{
    public static function generateArrayOfCodes(
        int $count,
        ?int $maxLength = null,
        ?array $alreadyExistingCodes = null
    ): array {
        $codes = [];
        for ($i = 0; $i < $count; ++$i) {
            $codes[] = self::generateAvailableCode($codes, $alreadyExistingCodes, $maxLength);
        }

        return $codes;
    }

    private static function generateAvailableCode(
        array $oldCodes1,
        ?array $oldCodes2 = null,
        ?int $maxLength = null
    ): string {
        do {
            $code = self::generateCode($maxLength);
        } while (self::isCodeTaken($code, $oldCodes1, $oldCodes2));

        return $code;
    }

    private static function generateCode(?int $maxLength = null): string
    {
        $code = strtoupper(md5(uniqid(mt_rand(), true)));
        if ($maxLength && $maxLength > 0) {
            $code = substr($code, 0, $maxLength);
        }

        return $code;
    }

    private static function isCodeTaken(
        string $newCode,
        array $oldCodes1,
        ?array $oldCodes2 = null
    ): bool {
        return \in_array($newCode, $oldCodes1) || ($oldCodes2 && \in_array($newCode, $oldCodes2));
    }
}
