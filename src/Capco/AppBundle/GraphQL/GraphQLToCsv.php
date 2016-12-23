<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;
use GraphQL\Language\Parser;
use GraphQL\Language\Source;
use GraphQL\Executor\Executor;

// code from GraphQL\Type\Definition\ResolveInfo;
function foldSelectionSet($selectionSet)
{
    $fields = [];
    foreach ($selectionSet->selections as $selectionNode) {
        $fields[$selectionNode->name->value] = !empty($selectionNode->selectionSet)
            ? foldSelectionSet($selectionNode->selectionSet)
            : true;
    }
    return $fields;
}

function appendString($string, $array, &$result) {
    if (is_array($array)) {
      foreach ($array as $key => $value) {
        appendString(($string !== '' ? $string . '_' : '').  $key, $value, $result);
      }
      return;
    }
    $result[] = $string;
}


      function is_multi($a) {
          $rv = array_filter($a,'is_array');
          if(count($rv)>0) return true;
          return false;
      }

      function getCleanRow($headers) {
          return array_combine($headers, array_map(function ($h) { return ""; }, $headers));
      }

      function writeRowData(&$row, $currentData, $fieldKey) {
        foreach ($currentData as $dataFieldKey => $dataFieldValue) {
          if (!is_array($dataFieldValue)) {
            $rowName = $fieldKey. '_' . $dataFieldKey;
            if (array_key_exists($rowName, $row)) {
                $row[$rowName] = $dataFieldValue;
            } else {
              // echo "missing: " . $rowName . PHP_EOL;
            }
          }
          else {
            if (!is_multi($dataFieldValue)) {
              writeRowData($row, $dataFieldValue, $fieldKey . '_'. $dataFieldKey);
            }
          }
        }
      }

      function writeNewRow (&$rows, $currentData, $headers, $fieldKey) {
        $row = getCleanRow($headers);
          writeRowData($row, $currentData, $fieldKey);
          foreach ($currentData as $dataFieldKey => $dataFieldValue) {
            if (is_array($dataFieldValue) && is_multi($dataFieldValue)) {
              foreach ($dataFieldValue as $key => $value) {
                writeNewRow($rows, $value, $headers, $fieldKey . '_'. $dataFieldKey);
              }
            }
          }
        $rows[] = array_values($row);
      }

class GraphQLToCsv
{
    private function queryStringToFields(string $requestString)
    {
      $documentNode = Parser::parse(new Source($requestString));
      foreach ($documentNode->definitions as $definition) {
        if ($definition->kind === 'OperationDefinitionNode') {
          return foldSelectionSet($defition->selectionSet);
        }
      }
      return [];
    }

    private function guessHeadersFromFields(array $fields)
    {
      $headers = [];
      appendString('', $fields, $headers);
      return $headers;
    }


    public function generate(string $requestString, array $requestResult, Writer &$writer)
    {
      $fields = $this->queryStringToFields($requestString);
      $headers = $this->guessHeadersFromFields($fields);
      $writer->insertOne($headers);

      foreach (array_keys($fields) as $fieldKey) {
          $rows = [];
          foreach ($requestResult[$fieldKey] as $currentData) {
            writeNewRow($rows, $currentData, $headers, $fieldKey);
          }
          $writer->insertAll($rows);
      }
   }
}
