<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Query;
use League\Csv\Writer;

class CreateCsvFromConsultationStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:consultation')
            ->setDescription('Create csv file from consultation step data');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $client = new Client(['base_url' => 'http://capco.dev']);
        $query = '{ consultations(id: 1) { id contributions { id title body author { id } arguments { id type body } } } }';

        $request = $client->createRequest(
            'GET',
            '/',
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
        $data = $response->json()['data'];

        $headers = [
            'proposition_id',
            'proposition_title',
            'proposition_content',
            'proposition_author_id',
            'argument_id',
            'argument_type',
            'argument_content',
        ];

        $writer = Writer::createFromPath('web/export/popo.csv', 'w');
        $writer->setDelimiter(",");
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        $writer->insertOne($headers);

        foreach ($data['consultations'] as $consultation) {
            foreach ($consultation['contributions'] as $contribution) {
              $writer->insertOne([
                $contribution['id'],
                $contribution['title'],
                $contribution['body'],
                $contribution['author']['id'],
                "",
                "",
                "",
              ]);
              foreach ($contribution['arguments'] as $argument) {
                $writer->insertOne([
                  "",
                  "",
                  "",
                  "",
                  $argument['id'],
                  $argument['type'],
                  $argument['body'],
                ]);
              }
            }
        }
    }
}
