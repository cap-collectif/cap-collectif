<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\GraphQLToCsv;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Toggle\Manager;
use League\Csv\Writer;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromConsultationStepCommand extends Command
{
    protected $toggleManager;
    protected $consultationStepRepository;
    protected $graphQLToCsv;
    protected $kernelRootDir;

    public function __construct(Manager $toggleManager,
                                ConsultationStepRepository $consultationStepRepository,
                                GraphQLToCsv $graphQLToCsv,
                                string $kernelRootDir
    ) {
        $this->toggleManager = $toggleManager;
        $this->consultationStepRepository = $consultationStepRepository;
        $this->graphQLToCsv = $graphQLToCsv;
        $this->kernelRootDir = $kernelRootDir;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setName('capco:export:consultation')
            ->setDescription('Create csv file from consultation step data');
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        $steps = $this->consultationStepRepository->findAll();

        foreach ($steps as $step) {
            if ($step->getProject()) {
                $requestString = $this->getContributionsGraphQLqueryByConsultationStep($step);
                $fileName = $step->getProject()->getSlug() . '_' . $step->getSlug() . '.csv';
                $writer = Writer::createFromPath($this->kernelRootDir . '/../web/export/' . $fileName, 'w');
                $writer->setDelimiter(',');
                $writer->setNewline("\r\n");
                $writer->setOutputBOM(Writer::BOM_UTF8);
                $this->graphQLToCsv->generate(
                  $requestString,
                  $writer
                );
                $output->writeln('The export file "' . $fileName . '" has been created.');
            }
        }
    }

    private function getContributionsGraphQLqueryByConsultationStep(ConsultationStep $constulationStep)
    {
        return '
fragment relatedInfos on Contribution {
   related {
     id
     kind
   }
}
fragment voteInfos on YesNoPairedVote {
   id
   ...authorInfos
   value
   createdAt
   expired
}
fragment trashableInfos on TrashableContribution {
  trashed
  trashedAt
  trashedReason
}
fragment authorInfos on ContributionWithAuthor {
  author {
    id
  }
}
fragment reportInfos on Reporting {
  ...relatedInfos
  id
  ...authorInfos
  type
  body
  createdAt
}
fragment argumentInfos on Argument {
  ...relatedInfos
  id
  ...authorInfos
  type
  body
  createdAt
  updatedAt
  url
  expired
  published
  ...trashableInfos
  votesCount
}
fragment sourceInfos on Source {
  ...relatedInfos
  id
  ...authorInfos
  body
  createdAt
  updatedAt
  expired
  published
  ...trashableInfos
  votesCount
}
{
  contributions(consultation: "' . $constulationStep->getId() . '") {
    id
  	...authorInfos
    section {
      title
    }
    title
    bodyText
    createdAt
    updatedAt
    url
    expired
    published
  	...trashableInfos
    votesCount
    votesCountOk
    votesCountMitige
    votesCountNok
    argumentsCount
    argumentsCountFor
    argumentsCountAgainst
    sourcesCount
    versionsCount
    arguments {
  		...argumentInfos
    }
    sources {
  		...sourceInfos
    }
    reportings {
  		...reportInfos
    }
    versions {
      ...relatedInfos
      id
  		...authorInfos
      title
      bodyText
      comment
      createdAt
      updatedAt
      url
      expired
      published
  		...trashableInfos
      votesCount
      votesCountOk
      votesCountMitige
      votesCountNok
      argumentsCount
      argumentsCountFor
      argumentsCountAgainst
      sourcesCount
      arguments {
  			...argumentInfos
      }
      sources {
  			...sourceInfos
      }
      reportings {
  			...reportInfos
      }
      votes {
        ...voteInfos
      }
   }
   votes {
      ...voteInfos
   }
 }
}';
    }
}
