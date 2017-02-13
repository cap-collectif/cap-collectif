<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;

class GraphQLToCsv
{
    protected $infoResolver;
    protected $csvGenerator;

    public function generate(string $requestString, $executor, Writer $writer)
    {
        $response = $executor->execute([
          'query' => $requestString,
          'variables' => [],
        ], [], null)->toArray();

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

                // https://github.com/thephpleague/csv/issues/114
                usleep(100);
            }
        }
    }

}
