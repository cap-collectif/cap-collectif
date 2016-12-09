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

  const headers = [
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

    public function getCleanRow() {
      return array_combine(CreateCsvFromConsultationStepCommand::headers, array_map(function ($h) { return ""; }, CreateCsvFromConsultationStepCommand::headers));
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

        $writer = Writer::createFromPath('web/export/papapo.csv', 'w');
        $writer->setDelimiter(",");
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        $writer->insertOne(CreateCsvFromConsultationStepCommand::headers);

        $data = $this->queryGraphql($query);
        foreach ($data['consultations'] as $consultation) {
            $progress = new ProgressBar($output, count($consultation['contributions']));
            $progress->setFormat('debug');
            $progress->start();
            foreach ($consultation['contributions'] as $key => $contribution) {
              $progress->advance();
              $row = $this->getCleanRow();
              $row["proposition_id"] = $contribution['id'];
              $row['proposition_title'] = $contribution['title'];
              $row['proposition_content'] = $contribution['body'];
              $row['proposition_section_title'] = $contribution['section']['title'];
              $row['proposition_author_id'] = $contribution['author']['id'];
              $row['proposition_url'] = $contribution['url'];
              $row['proposition_votes_count_ok'] = $contribution['votesCountOk'];
              $row['proposition_votes_count_nok'] = $contribution['votesCountNok'];
              $row['proposition_votes_count_paired'] = $contribution['votesCountMitige'];
              $writer->insertOne(array_values($row));
              $votes = $this->queryGraphql($this->getVotesQuery($contribution['id']))['votesByContribution'];
              foreach ($votes as $vote) {
                $row = $this->getCleanRow();
                $row['proposition_votes_author_id'] = $vote['author']['id'];
                $row['proposition_votes_value'] = $vote['value'];
                $writer->insertOne(array_values($row));
              }
              foreach ($contribution['arguments'] as $argument) {
                $row = $this->getCleanRow();
                $row['argument_id'] = $argument['id'];
                $row['argument_type'] = $argument['type'];
                $row['argument_content'] = $argument['body'];
                $row['argument_votes_count'] = $argument['votesCount'];
                $writer->insertOne(array_values($row));
              }
              foreach ($contribution['sources'] as $source) {
                $row = $this->getCleanRow();
                $row['source_id'] = $source['id'];
                $row['source_content'] = $source['body'];
                $row['source_votes_count'] = $source['votesCount'];
                $writer->insertOne(array_values($row));
              }
            }
            $progress->finish();
        }
    }
}
