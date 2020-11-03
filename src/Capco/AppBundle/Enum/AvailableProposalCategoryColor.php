<?php

namespace Capco\AppBundle\Enum;

final class AvailableProposalCategoryColor implements EnumType
{

    public const COLOR_EF5350 = "#ef5350";
    public const COLOR_B71C1C = "#b71c1c";
    public const COLOR_880E4F = "#880e4f";
    public const COLOR_C2185B = "#c2185b";
    public const COLOR_9C27B0 = "#9c27b0";
    public const COLOR_6A1B9A = "#6a1b9a";
    public const COLOR_673AB7 = "#673ab7";
    public const COLOR_3F51B5 = "#3f51b5";
    public const COLOR_0D47A1 = "#0d47a1";
    public const COLOR_1E88E5 = "#1e88e5";
    public const COLOR_0097A7 = "#0097a7";
    public const COLOR_00796B = "#00796b";
    public const COLOR_004D40 = "#004d40";
    public const COLOR_1B5E20 = "#1b5e20";
    public const COLOR_43A047 = "#43a047";
    public const COLOR_558B2F = "#558b2f";
    public const COLOR_827717 = "#827717";
    public const COLOR_FFC107 = "#ffc107";
    public const COLOR_FF9800 = "#ff9800";
    public const COLOR_E65100 = "#e65100";
    public const COLOR_BF360C = "#bf360c";
    public const COLOR_795548 = "#795548";
    public const COLOR_5D4037 = "#5d4037";
    public const COLOR_3E2723 = "#3e2723";
    public const COLOR_616161 = "#616161";
    public const COLOR_78909C = "#78909c";
    public const COLOR_455A64 = "#455a64";
    public const COLOR_263238 = "#263238";


    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::COLOR_EF5350,
            self::COLOR_B71C1C,
            self::COLOR_880E4F,
            self::COLOR_C2185B,
            self::COLOR_9C27B0,
            self::COLOR_6A1B9A,
            self::COLOR_673AB7,
            self::COLOR_3F51B5,
            self::COLOR_0D47A1,
            self::COLOR_1E88E5,
            self::COLOR_0097A7,
            self::COLOR_00796B,
            self::COLOR_004D40,
            self::COLOR_1B5E20,
            self::COLOR_43A047,
            self::COLOR_558B2F,
            self::COLOR_827717,
            self::COLOR_FFC107,
            self::COLOR_FF9800,
            self::COLOR_E65100,
            self::COLOR_BF360C,
            self::COLOR_795548,
            self::COLOR_5D4037,
            self::COLOR_3E2723,
            self::COLOR_616161,
            self::COLOR_78909C,
            self::COLOR_455A64,
            self::COLOR_263238,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
