<?php

namespace Capco\AppBundle\GraphQL;

class CsvWriter
{
    private $headers = [];

    public function setHeaders(array $headers)
    {
        $this->headers = $headers;
    }

    public function writeRowData(&$row, array $currentData, string $fieldKey)
    {
        foreach ($currentData as $dataFieldKey => $dataFieldValue) {
            if (!\is_array($dataFieldValue)) {
                $rowName = $fieldKey . '_' . $dataFieldKey;
                if (array_key_exists($rowName, $row)) {
                    $row[$rowName] = $dataFieldValue;
                } else {
                    echo 'missing: ' . $rowName . PHP_EOL;
                }
            } else {
                if (!$this->isMultiDimensionalArray($dataFieldValue)) {
                    $this->writeRowData($row, $dataFieldValue, $fieldKey . '_' . $dataFieldKey);
                }
            }
        }
    }

    public function writeNewRow(&$rows, array $currentData, string $fieldKey)
    {
        $row = $this->createCleanRow();
        $this->writeRowData($row, $currentData, $fieldKey);
        $rows[] = array_values($row);
        // children rows
        foreach ($currentData as $dataFieldKey => $dataFieldValue) {
            if (\is_array($dataFieldValue) && $this->isMultiDimensionalArray($dataFieldValue)) {
                foreach ($dataFieldValue as $key => $value) {
                    if ($value) {
                        $this->writeNewRow($rows, $value, $fieldKey . '_' . $dataFieldKey);
                    }
                }
            }
        }
    }

    private function isMultiDimensionalArray(array $array): bool
    {
        return \count(array_filter($array, 'is_array')) > 0;
    }

    private function createCleanRow(): array
    {
        return array_combine($this->headers, array_map(function ($h) {
            return '';
        }, $this->headers));
    }
}
