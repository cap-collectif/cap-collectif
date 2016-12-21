<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Query;
use League\Csv\Writer;
use Symfony\Component\Console\Helper\ProgressBar;
use GraphQL\Language\Parser;
use GraphQL\Language\Source;
use GraphQL\Executor\Executor;

class CreateCsvFromConsultationStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:consultation')
            ->setDescription('Create csv file from consultation step data');
    }

    public function queryGraphql(string $query)
    {
      $client = new Client(['base_url' => 'http://capco.dev']);
      $request = $client->createRequest(
          'GET',
          '/graphql/',
          [
            'query' => [ 'query' => $query ],
            'headers' => [
              'CONTENT_TYPE' => 'application/graphql'
            ],
          ]
      );
      $urlQuery = $request->getQuery();
      $urlQuery->setEncodingType(Query::RFC1738);
      $request->setQuery($urlQuery);
      $response = $client->send($request);
      $response = $response->json();
      return $response['data'];
    }

    // public function getVotesQuery(int $id)
    // {
    //   return '{
    //       votesByContribution(contribution: '.$id.') {
    //         value
    //         author {
    //           id
    //         }
    //       }
    //    }';
    // }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
      $requestString = '{
          contributions(consultation: 1) {
           id
           title
           body
           url
           votesCountOk
           votesCountNok
           votesCountMitige
           section {
            title
           }
           author {
            id
            type {
              name
            }
           }
           arguments {
            id
            type
            body
            votesCount
           }
           sources {
            id
            body
            votesCount
           }
          }
       }';

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
        $documentNode = Parser::parse(new Source($requestString));
        $fields = foldSelectionSet($documentNode->definitions[0]->selectionSet);
        // dump($fields);

function appendString($string, $array, &$result) {
    if (is_array($array)) {
      foreach ($array as $key => $value) {
        appendString(($string !== '' ? $string . '_' : '').  $key, $value, $result);
      }
      return;
    }
    $result[] = $string;
}
        $headers = [];
        appendString('', $fields, $headers);

        $writer = Writer::createFromPath('web/export/papapo.csv', 'w');
        $writer->setDelimiter(",");
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        $writer->insertOne($headers);

        $data = $this->queryGraphql($requestString);

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

        foreach (array_keys($fields) as $fieldKey) {
          $rows = [];
          // $progress = new ProgressBar($output, count($data[$fieldKey]));
          // $progress->setFormat('debug');
          // $progress->start();
          foreach ($data[$fieldKey] as $currentData) {
            writeNewRow($rows, $currentData, $headers, $fieldKey);
            // $progress->advance();
          }
          // $progress->finish();
          // dump($rows);
          $writer->insertAll($rows);
        }
    }
}
