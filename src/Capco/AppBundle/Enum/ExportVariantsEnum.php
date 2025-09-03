<?php

namespace Capco\AppBundle\Enum;

enum ExportVariantsEnum: string {
    case FULL = 'full';

    case SIMPLIFIED = 'simplified';

    case GROUPED = 'grouped';

    public static function isFull(self $variant): bool
    {
        return self::FULL === $variant;
    }

    public static function isSimplified(self $variant): bool
    {
        return self::SIMPLIFIED === $variant;
    }

    public static function isGrouped(self $variant): bool
    {
        return self::GROUPED === $variant;
    }

    public static function getFileSuffix(ExportVariantsEnum $variant): string
    {
        return match ($variant) {
            ExportVariantsEnum::SIMPLIFIED => '_' . ExportVariantsEnum::SIMPLIFIED->value,
            ExportVariantsEnum::GROUPED => '_' . ExportVariantsEnum::GROUPED->value,
            ExportVariantsEnum::FULL => '',
        };
    }
}
