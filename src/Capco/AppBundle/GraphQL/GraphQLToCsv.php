<?php

namespace Capco\AppBundle\GraphQL;

use Box\Spout\Writer\CSV\Writer;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;

class GraphQLToCsv
{
    protected $infoResolver;
    protected $csvGenerator;
    protected $logger;
    protected $executor;

    public function __construct(
        LoggerInterface $logger,
        GraphQlAclListener $listener,
        Executor $executor
    ) {
        $this->logger = $logger;
        $this->executor = $executor;
        $listener->disableAcl();
    }

    public function generate(string $requestString, Writer $writer)
    {
        $response = $this->executor
            ->execute('internal', [
                'query' => $requestString,
                'variables' => []
            ])
            ->toArray();

        if (!isset($response['data'])) {
            if (isset($response['error'])) {
                $this->logger->error('GraphQL Query Error: ' . $response['error']);
            }
            if (isset($response['errors'])) {
                $this->logger->error('GraphQL Query Errors: ' . $response['errors']);
            }
            $this->logger->info('Last graphQL query: ' . json_encode($response));
        }

        $this->infoResolver = new InfoResolver();
        $this->csvGenerator = new CsvWriter();

        $headers = $this->infoResolver->guessHeadersFromFields($response['data']);

        $writer->addRow($headers);
        $this->csvGenerator->setHeaders($headers);

        foreach ($response['data'] as $fieldKey => $field) {
            $rows = [];
            foreach ($response['data'][$fieldKey] as $currentData) {
                $this->csvGenerator->writeNewRow($rows, $currentData, $fieldKey);
            }
            foreach ($rows as $row) {
                $writer->addRow($row);
                // https://github.com/thephpleague/csv/issues/114
                usleep(100);
            }
        }
    }
}
