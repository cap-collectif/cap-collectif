<?php

namespace Capco\AppBundle\Command\Nantes;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\EventListener\ReferenceEventListener;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\UserBundle\Entity\User;
use Cocur\Slugify\Slugify;
use Doctrine\ORM\EntityManagerInterface;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class NantesImportContributionsCommand extends ContainerAwareCommand
{
    protected const PROPOSAL_BATCH_SIZE = 50;

    protected const CONCERTATION_FILE = 'concertations.csv';
    protected const DEMARCHE_FILE = 'demarches.csv';
    protected const CONTRIBUTION_FILE = 'contributions.csv';

    protected const CONCERTATION_HEADER = [
        'id',
        'state',
        'titre',
        'description',
        'closeTextLeft',
        'closeTextRight',
        'districtUuid',
        'contributions',
        'infos',
    ];

    protected const DEMARCHE_HEADER = [
        'id',
        'state',
        'description',
        'closeTextLeft',
        'closeTextRight',
        'thematicUuid',
        'contributions',
        'infos',
        'concertations',
    ];

    protected const CONTRIBUTION_HEADER = [
        'id',
        'globalId',
        'description',
        'districtUuid',
        'concertationUuid',
        'videoLink',
        'userUuid',
        'role',
        'files',
        'createdDate',
        'lastPublishedDate',
    ];

    protected const PROJECTS = [
        self::DEMARCHE_FILE => self::DEMARCHE_HEADER,
        self::CONCERTATION_FILE => self::CONCERTATION_HEADER,
    ];

    /** @var EntityManagerInterface */
    protected $em;

    protected $projects = [];
    protected $proposals = [];

    public function slugify($text)
    {
        // replace non letter or digits by -
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);

        // transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

        // remove unwanted characters
        $text = preg_replace('~[^-\w]+~', '', $text);

        // trim
        $text = trim($text, '-');

        // remove duplicate -
        $text = preg_replace('~-+~', '-', $text);

        // lowercase
        $text = strtolower($text);

        if (empty($text)) {
            return 'n-a';
        }

        return $text;
    }

    protected function configure(): void
    {
        $this->setName('capco:import:nantes-proposals')->setDescription(
            'Import proposals from nantes csv'
        );
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setSQLLogger(null);
        $this->proposals = $this->createProposals();
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $this->disableListeners($output);
        $stopwatch = new Stopwatch();
        $stopwatch->start('import');
        $this->importProjects($output);
        $event = $stopwatch->stop('import');
        $output->writeln(
            "\n<info>Elapsed time : " .
                round($event->getDuration() / 1000 / 60, 2) .
                " minutes. \n Memory usage : " .
                round($event->getMemory() / 1000000, 2) .
                ' MB</info>'
        );
    }

    protected function importProjects(OutputInterface $output): void
    {
        $output->writeln('<info>Importing concertations into projects...</info>');

        $csv = Reader::createFromPath(__DIR__ . '/' . self::CONCERTATION_FILE);
        $csv->setDelimiter(';');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::CONCERTATION_HEADER);
        $rows = [];
        foreach ($iterator as $item) {
            $rows[] = $item;
        }
        $alreadyDone = [];
        $ref = 2000;
        foreach ($rows as $key => $row) {
            $projects = $this->em
                ->getRepository(Project::class)
                ->findBy(['title' => $row['titre']]);
            if (1 === \count($projects)) {
                $proposalForm = $this->createProposalForm($output, $projects[0], $ref);
                $collectStep = $projects[0]->getFirstCollectStep();
                if ($collectStep && $collectStep instanceof CollectStep) {
                    $this->projects[$row['id']] = $projects[0];
                    $collectStep->setProposalForm($proposalForm);
                }
                $this->importProposals($output, $row['id'], $projects[0]->getId());
            } elseif (\count($projects) > 1) {
                foreach ($projects as $k => $project) {
                    $toSlug = 0 === $k ? $row['titre'] : $row['titre'] . '-' . $k;
                    $slug = $this->slugify($toSlug);
                    if (!\in_array($slug, $alreadyDone, false)) {
                        $realProject = $this->em
                            ->getRepository(Project::class)
                            ->findOneBy(['slug' => $slug]);
                        $proposalForm = $this->createProposalForm($output, $realProject, $ref);
                        $collectStep = $realProject->getFirstCollectStep();
                        if ($collectStep && $collectStep instanceof CollectStep) {
                            $this->projects[$row['id']] = $realProject;
                            $collectStep->setProposalForm($proposalForm);
                        }
                        $this->importProposals($output, $row['id'], $realProject->getId());
                        $alreadyDone[] = $slug;
                    }
                    ++$ref;
                }
            }
            ++$ref;
        }

        $output->writeln(
            "\n<info>Successfully fetched " . \count($this->projects) . ' projects.</info>'
        );
    }

    protected function createProposals(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/' . self::CONTRIBUTION_FILE);
        $csv->setDelimiter(';');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::CONTRIBUTION_HEADER);
        $proposals = [];
        foreach ($iterator as $item) {
            $proposals[] = $item;
        }
        $proposals = $this->arrayGroupBy($proposals, function ($i) {
            return $i['concertationUuid'];
        });

        return $proposals;
    }

    protected function importProposals(
        OutputInterface $output,
        string $oldProjectId,
        string $projectId
    ): void {
        $project = $this->em->getRepository(Project::class)->find($projectId);
        $step = $project->getFirstCollectStep();
        if ($step && isset($this->proposals[$oldProjectId])) {
            $output->writeln(
                "\n<info>Importing proposals for project \"" . $project->getTitle() . '"...</info>'
            );
            $proposals = $this->proposals[$oldProjectId];
            $progress = new ProgressBar($output, \count($proposals));
            $count = 1;
            foreach ($proposals as $proposal) {
                $date = \date_parse($proposal['createdDate']);
                $date = new \DateTime($date['year'] . '-' . $date['month'] . '-' . $date['day']);
                $author = $this->em->getRepository(User::class)->findOneBy([
                    'openId' => $proposal['userUuid'],
                ]);
                if ($author) {
                    $description =
                        '' !== $proposal['videoLink']
                            ? $proposal['description'] .
                                '<br/><a href="' .
                                $proposal['videoLink'] .
                                '">Vidéo</a>'
                            : $proposal['description'];
                    $proposal = (new Proposal())
                        ->setTitle('Contribution n° ' . $count)
                        ->setAuthor($author)
                        ->setPublishedAt($date)
                        ->setUpdatedAt(new \DateTime())
                        ->setProposalForm($step->getProposalForm())
                        ->setReference($count)
                        ->setBody(html_entity_decode($description));
                    $this->em->persist($proposal);
                    if (0 === $count % self::PROPOSAL_BATCH_SIZE) {
                        $this->printMemoryUsage($output);
                        $this->em->flush();
                    }
                } else {
                    $output->writeln(
                        "\n<info>No Author found for user uuid \"" .
                            $proposal['userUuid'] .
                            '"</info>'
                    );
                }
                $progress->advance();
                ++$count;
            }
            $progress->finish();
            $output->writeln("\n<info>Successfully imported proposals.</info>");
        } else {
            $output->writeln(
                "\n<info>No proposals found for project \"" . $project->getTitle() . '"</info>'
            );
        }
    }

    protected function createProposalForm(
        OutputInterface $output,
        Project $project,
        int $uniqueId
    ): ProposalForm {
        $formName = 'Formulaire pour "' . $project->getTitle() . '"';
        $output->writeln('<info>Creating "' . $formName . '" form...</info>');

        $proposalForm = (new ProposalForm())
            ->setTitle($formName)
            ->setTitleHelpText('Choisissez un titre pour votre proposition')
            ->setReference($uniqueId)
            ->setDescriptionHelpText('Décrivez votre proposition');

        $this->em->persist($proposalForm);
        $this->em->flush();

        $output->writeln('<info>Successfully added "' . $formName . '" form.</info>');

        return $proposalForm;
    }

    private function disableListeners(OutputInterface $output): void
    {
        foreach ($this->em->getEventManager()->getListeners() as $event => $listeners) {
            foreach ($listeners as $key => $listener) {
                if ($listener instanceof ReferenceEventListener) {
                    $this->em->getEventManager()->removeEventListener(['preFlush'], $listener);
                    $output->writeln('Disabled <info>' . \get_class($listener) . '</info>');
                }
                if ($listener instanceof DoctrineListener) {
                    $this->em->getEventManager()->removeEventListener(['prePersist'], $listener);
                    $output->writeln('Disabled <info>' . \get_class($listener) . '</info>');
                }
            }
        }
    }

    private function printMemoryUsage(OutputInterface $output): void
    {
        $output->write("\n");
        $output->writeln(
            sprintf(
                'Memory usage (currently) %dKB/ (max) %dKB',
                round(memory_get_usage(true) / 1024),
                memory_get_peak_usage(true) / 1024
            )
        );
    }

    private function arrayGroupBy(array $arr, callable $key_selector): array
    {
        $result = [];
        foreach ($arr as $i) {
            $key = \call_user_func($key_selector, $i);
            $result[$key][] = $i;
        }

        return $result;
    }
}
