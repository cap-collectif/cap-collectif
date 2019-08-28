<?php

namespace Capco\AppBundle\DBAL\Enum;

use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Platforms\AbstractPlatform;

abstract class AbstractEnumType extends Type
{
    protected $name;
    protected $values = [];

    public function getSQLDeclaration(array $fieldDeclaration, AbstractPlatform $platform): string
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
