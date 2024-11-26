<?php

namespace Capco\AppBundle\Command\Maker;

class NamespaceResolver
{
    public static function getFullQualifiedClassName(string $filename): string
    {
        return self::getNamespace($filename) . '\\' . self::getClassname($filename);
    }

    private static function getNamespace(string $filename): string
    {
        $lines = file($filename);
        $array = preg_grep('/^namespace /', $lines);
        $namespaceLine = array_shift($array);
        $match = [];
        preg_match('/^namespace (.*);$/', (string) $namespaceLine, $match);

        return array_pop($match);
    }

    private static function getClassname(string $filename): string
    {
        $directoriesAndFilename = explode('/', $filename);
        $filename = array_pop($directoriesAndFilename);
        $nameAndExtension = explode('.', $filename);

        return array_shift($nameAndExtension);
    }
}
