<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Query;
use League\Csv\Writer;
use Symfony\Component\Console\Helper\ProgressBar;

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
      $response = $response->json();
      return $response['data'];
    }

    public function getVotesQuery(int $id)
    {
      return '{
          votesByContribution(contribution: '.$id.') {
            value
            author {
              id
            }
          }
       }';
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
      $query = '{
        consultations {
           id
           contributions {
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
         }
       }';

        $headers = [
            'proposition_id',
            'proposition_title',
            'proposition_content',
            'proposition_section_title',
            'proposition_author_id',
            'proposition_url',
            'proposition_votes_count_ok',
            'proposition_votes_count_nok',
            'proposition_votes_count_paired',

            'proposition_votes_author_id',
            'proposition_votes_value',

            'argument_id',
            'argument_type',
            'argument_content',
            'argument_votes_count',

            'source_id',
            'source_content',
            'source_votes_count',
        ];

        $writer = Writer::createFromPath('web/export/papapo.csv', 'w');
        $writer->setDelimiter(",");
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        $writer->insertOne($headers);

        $data = $this->queryGraphql($query);
        foreach ($data['consultations'] as $consultation) {
            $progress = new ProgressBar($output, count($consultation['contributions']));
            $progress->setFormat('debug');
            $progress->start();
            foreach ($consultation['contributions'] as $key => $contribution) {
              $progress->advance();
              $writer->insertOne([
                $contribution['id'],
                $contribution['title'],
                $contribution['body'],
                $contribution['section']['title'],
                $contribution['author']['id'],
                $contribution['url'],
                $contribution['votesCountOk'],
                $contribution['votesCountNok'],
                $contribution['votesCountMitige'],
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
              ]);
              $votes = $this->queryGraphql($this->getVotesQuery($contribution['id']))['votesByContribution'];
              foreach ($votes as $vote) {
                $writer->insertOne([
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  $vote['author']['id'],
                  $vote['value'],
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                ]);
              }
              foreach ($contribution['arguments'] as $argument) {
                $writer->insertOne([
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  $argument['id'],
                  $argument['type'],
                  $argument['body'],
                  $argument['votesCount'],
                  "",
                  "",
                  "",
                ]);
              }
              foreach ($contribution['sources'] as $source) {
                $writer->insertOne([
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  "",
                  $source['id'],
                  $source['body'],
                  $source['votesCount'],
                ]);
              }
            }
            $progress->finish();
        }
    }
}
