<?php

namespace Capco\AppBundle\GraphQL;

class CsvWriter
{
    private $header = [];

    public function setHeaders(array $headers)
    {
        $this->headers = $headers;
    }

    private function isMultiDimensionalArray(array $array): bool
    {
        return count(array_filter($array, 'is_array')) > 0;
    }

    private function getCleanRow(): array
    {
        return array_combine($this->headers, array_map(function ($h) {
            return '';
        }, $this->headers));
    }

    public function writeRowData(&$row, array $currentData, string $fieldKey)
    {
        foreach ($currentData as $dataFieldKey => $dataFieldValue) {
            if (!is_array($dataFieldValue)) {
                $rowName = $fieldKey.'_'.$dataFieldKey;
                if (array_key_exists($rowName, $row)) {
                    $row[$rowName] = $dataFieldValue;
                } else {
                    echo 'missing: '.$rowName.PHP_EOL;
                }
            } else {
                if (!$this->isMultiDimensionalArray($dataFieldValue)) {
                    $this->writeRowData($row, $dataFieldValue, $fieldKey.'_'.$dataFieldKey);
                }
            }
        }
    }

    public function writeNewRow(&$rows, array $currentData, string $fieldKey)
    {
        $row = $this->getCleanRow();
        $this->writeRowData($row, $currentData, $fieldKey);
        $rows[] = array_values($row);
      // children rows
      foreach ($currentData as $dataFieldKey => $dataFieldValue) {
          if (is_array($dataFieldValue) && $this->isMultiDimensionalArray($dataFieldValue)) {
              foreach ($dataFieldValue as $key => $value) {
                  $this->writeNewRow($rows, $value, $fieldKey.'_'.$dataFieldKey);
              }
          }
      }
    }
}
