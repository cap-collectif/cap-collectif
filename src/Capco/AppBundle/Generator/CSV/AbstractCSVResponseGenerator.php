<?php

namespace Capco\AppBundle\Generator\CSV;

use Symfony\Component\HttpFoundation\Response;

abstract class AbstractCSVResponseGenerator
{
    public const FRENCH_SEPARATOR = ';';
    public const COMMA_SEPARATOR = ',';
    public const SPACE_SEPARATOR = ' ';
    public const SEPARATORS = [
        self::FRENCH_SEPARATOR,
        self::COMMA_SEPARATOR,
        self::SPACE_SEPARATOR,
    ];

    protected static function generate(
        array $headers,
        array $data,
        string $separator = self::FRENCH_SEPARATOR
    ): Response {
        $rows = [];

        $rows[] = self::createLine($headers, $separator);

        foreach ($data as $datum) {
            $rows[] = self::createLine($datum, $separator);
        }

        $response = new Response(implode("\n", $rows));
        $response->headers->set('Content-Type', 'text/csv');

        return $response;
    }

    private static function createLine(
        array $row,
        string $separator = self::FRENCH_SEPARATOR
    ): string {
        $protectedRow = [];
        foreach ($row as $cell) {
            $protectedRow[] = self::protectCell($cell);
        }

        return implode($separator, $protectedRow);
    }

    private static function protectCell(string $cell): string
    {
        $cell = str_replace(["\n", "\r"], ' ', $cell);
        foreach (self::SEPARATORS as $s) {
            if (strpos($cell, $s)) {
                return '"' . $cell . '"';
            }
        }

        return $cell;
    }
}
