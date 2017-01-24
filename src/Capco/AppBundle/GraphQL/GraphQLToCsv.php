<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;

class GraphQLToCsv
{
    public $infoResolver = null;
    public $csvGenerator = null;

    public function generate(string $requestString, $executor, Writer $writer)
    {
        $response = $executor->execute([
          'query' => $requestString,
          'variables' => []
        ], [], null)->toArray();

        if (isset($response['errors'])) {
          dump($response['errors']);
        }

        $this->infoResolver = new InfoResolver();
        $this->csvGenerator = new CsvWriter();

        $headers = $this->infoResolver->guessHeadersFromFields($response['data']);

        $writer->insertOne($headers);
        $this->csvGenerator->setHeaders($headers);

        foreach ($response['data'] as $fieldKey => $field) {
            $rows = [];
            foreach ($response['data'][$fieldKey] as $currentData) {
                $this->csvGenerator->writeNewRow($rows, $currentData, $fieldKey);
            }
            foreach ($rows as $row) {
                $writer->insertOne($row);
                usleep(100);
            }
        }
    }
}
