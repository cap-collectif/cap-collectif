<?php

declare(strict_types=1);

namespace Capco\AppBundle\PhpStan\Reflection;

interface PropertyReflection
{
    public function getType();

    public function isReadable(): bool;

    public function isWritable(): bool;
}
