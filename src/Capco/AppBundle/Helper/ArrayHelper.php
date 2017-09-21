<?php

namespace Capco\AppBundle\Helper;

class ArrayHelper
{
    public static function unflatten(array $flat, string $delimiter = '_'): array
    {
        $unflat = [];
        foreach ($flat as $key => $value) {
            $path = explode($delimiter, $key);
            if (count($path) === 1) {
                $unflat[$key] = $value === 'null' ? null : $value;
                continue;
            }
            $pointer = &$unflat;
            do {
                $level = array_shift($path);
                if (!isset($pointer[$level])) {
                    $pointer[$level] = [];
                }

                $tmpPointer = &$pointer[$level];
                unset($pointer);
                $pointer = &$tmpPointer;
                unset($tmpPointer);

                if (count($path) === 1) {
                    $lastKey = array_shift($path);
                    $pointer[$lastKey] = $value === 'null' ? null : $value;
                }
            } while (count($path));
        }

        return $unflat;
    }
}
