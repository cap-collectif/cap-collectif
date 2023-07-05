<?php

namespace Capco\AppBundle\DBAL\Enum;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

abstract class AbstractEnumType extends Type
{
    protected string $name;
    protected array $values = [];

    public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
    {
        $array_map = [];
        foreach ($this->values as $key => $val) {
            $array_map[$key] = sprintf("'%s'", $val);
        }
        $values = $array_map;

        return sprintf('ENUM(%s) COMMENT \'(DC2Type:%s)\'', implode(', ', $values), $this->name);
    }

    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        if (!\in_array($value, $this->values, true)) {
            throw new \InvalidArgumentException(sprintf("Invalid '%s' value.", $this->name));
        }

        return $value;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function requiresSQLCommentHint(AbstractPlatform $platform): bool
    {
        return true;
    }
}
