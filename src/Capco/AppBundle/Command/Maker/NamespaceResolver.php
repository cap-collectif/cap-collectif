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
        preg_match('/^namespace (.*);$/', $namespaceLine, $match);
        $fullNamespace = array_pop($match);

        return $fullNamespace;
    }

    private static function getClassname(string $filename): string
    {
        $directoriesAndFilename = explode('/', $filename);
        $filename = array_pop($directoriesAndFilename);
        $nameAndExtension = explode('.', $filename);
        $className = array_shift($nameAndExtension);

        return $className;
    }
}
