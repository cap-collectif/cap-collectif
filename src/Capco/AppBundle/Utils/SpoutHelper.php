<?php

namespace Capco\AppBundle\Utils;

use Box\Spout\Reader\SheetInterface;

/**
 * Inspired by: https://github.com/box/spout/issues/368.
 *
 * Simple helper class for Spout - to return rows indexed by the header in the sheet
 *
 * Author: Jaspal Singh - https://github.com/jaspal747
 * Feel free to make any edits as needed. Cheers!
 */
class SpoutHelper
{
    private array $rawHeadersArray = []; //Local array to hold the Raw Headers for performance
    private array $formattedHeadersArray = []; //Local array to hold the Formatted Headers for performance
    private readonly int $headerRowNumber; //Row number where the header col is located in the file

    /**
     * Initialize on a per sheet basis
     *  Allow users to mention which row number contains the headers.
     */
    public function __construct(SheetInterface $sheet, int $headerRowNumber = 1)
    {
        $this->flushHeaders();
        $this->headerRowNumber = $headerRowNumber;

        $this->getFormattedHeaders($sheet); //Since this also calls the getRawHeaders, we will have both the arrays set at once
    }

    /**
     * Set the rawHeadersArray by getting the raw headers from the headerRowNumber or the 1st row
     *  Once done, set them to a local variable for being reused later.
     */
    public function getRawHeaders(SheetInterface $sheet): array
    {
        if (empty($this->rawHeadersArray)) {
            // first get column headers
            foreach ($sheet->getRowIterator() as $key => $row) {
                if ($key == $this->headerRowNumber) {
                    // iterate once to get the column headers
                    $this->rawHeadersArray = $row->toArray();

                    break;
                }
            }
        }
        // From local cache

        return $this->rawHeadersArray;
    }

    /**
     * Set the formattedHeadersArray by getting the raw headers and the parsing them
     *  Once done, set them to a local variable for being reused later.
     */
    public function getFormattedHeaders(SheetInterface $sheet, bool $formatted = false): array
    {
        if (empty($this->formattedHeadersArray)) {
            $this->formattedHeadersArray = $this->getRawHeaders($sheet);

            // Now format them
            foreach ($this->formattedHeadersArray as $key => $value) {
                if (is_a($value, 'DateTime')) {
                    //Somehow instanceOf does not work well with DateTime, hence using is_a -- ?
                    $this->formattedHeadersArray[$key] = $value->format('Y-m-d'); //Since the dates in headers are avilable as DateTime Objects
                } elseif ($formatted) {
                    $this->formattedHeadersArray[$key] = strtolower(
                        str_replace(' ', '_', trim((string) $value))
                    );
                } else {
                    $this->formattedHeadersArray[$key] = trim((string) $value);
                }
                // Add more rules here as needed
            }
        }
        // Return from local cache

        return $this->formattedHeadersArray;
    }

    /**
     * Return row with Raw Headers.
     */
    public function rowWithRawHeaders(array $rowArray): array
    {
        return $this->returnRowWithHeaderAsKeys($this->rawHeadersArray, $rowArray);
    }

    /**
     * Return row with Formatted Headers.
     */
    public function rowWithFormattedHeaders(array $rowArray): array
    {
        return $this->returnRowWithHeaderAsKeys($this->formattedHeadersArray, $rowArray);
    }

    /**
     * Flush local caches before each sheet.
     */
    public function flushHeaders(): void
    {
        $this->formattedHeadersArray = [];
        $this->rawHeadersArray = [];
    }

    /**
     * Set the headers to keys and row as values.
     */
    private function returnRowWithHeaderAsKeys(array $headers, array $rowArray): array
    {
        $headerColCount = \count($headers);
        $rowColCount = \count($rowArray);
        $colCountDiff = $headerColCount - $rowColCount;

        if ($colCountDiff > 0) {
            //Pad the rowArray with empty values
            $rowArray = array_pad($rowArray, $headerColCount, '');
        }

        return array_combine($headers, $rowArray);
    }
}
