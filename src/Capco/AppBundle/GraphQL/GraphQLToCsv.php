<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;
use Monolog\Logger;
use Overblog\GraphQLBundle\Request\Executor;

class GraphQLToCsv
{
    protected $infoResolver;
    protected $csvGenerator;
    protected $logger;

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }

    public function generate(string $requestString, Executor $executor, Writer $writer)
    {
        $response = $executor->execute([
          'query' => $requestString,
          'variables' => [],
        ], ['disable_acl' => true])->toArray();

        if (!isset($response['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $response['error']);
            $this->logger->info('Last graphQL query: ' . json_encode($response));
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
                // https://github.com/thephpleague/csv/issues/114
                usleep(100);
            }
        }
    }
}
