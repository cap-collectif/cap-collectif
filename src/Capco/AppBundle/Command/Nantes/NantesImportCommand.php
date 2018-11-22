<?php

namespace Capco\AppBundle\Command\Nantes;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\EventListener\ReferenceEventListener;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Cocur\Slugify\Slugify;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class NantesImportCommand extends ContainerAwareCommand
{
    protected const PROPOSAL_BATCH_SIZE = 50;

    protected const CONCERTATION_FILE = 'concertations.csv';
    protected const DEMARCHE_FILE = 'demarches.csv';
    protected const CONTRIBUTION_FILE = 'contributions.csv';
    protected const ACTUALITY_FILE = 'actualites.csv';

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

    protected const ACTUALITY_HEADER = [
        'id',
        'subtitle',
        'catchphrase',
        'description',
        'rate',
        'thumbnail',
        'image',
        'userUuid',
        'districtUuid',
        'concertationUuid',
        'files',
        'createdAt',
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
    protected $actualities = [];
    protected $nantesAuthor;

    protected function configure(): void
    {
        $this->setName('capco:import:nantes')
            ->addArgument('email', InputArgument::OPTIONAL, 'The nantes admin email')
            ->setDescription('Import data from nantes');
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setSQLLogger(null);
        $this->proposals = $this->createProposals();
        $this->actualities = $this->createActualities();
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $this->nantesAuthor = $input->getArgument('email') ?? 'admin@test.com';
        $importUsersCommand = $this->getApplication()->find('capco:import:nantes-users');
        $usersInput = new ArrayInput(['command' => 'capco:import:nantes-users']);
        $importUsersCommand->run($usersInput, $output);
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
        $usersInput = new ArrayInput(['command' => 'capco:import:nantes-users-reset']);
        $importUsersCommand->run($usersInput, $output);
    }

    protected function importProjects(OutputInterface $output): void
    {
        $rows = [];

        foreach (self::PROJECTS as $filename => $projectHeader) {
            $csv = Reader::createFromPath(__DIR__ . '/' . $filename);
            //$type = $this->em->getRepository(ProjectType::class)->findOneBy(['title' => 'project.types.consultation']);
            $csv->setDelimiter(';');
            $iterator = $csv->setOffset(1)->fetchAssoc($projectHeader);
            foreach ($iterator as $item) {
                $rows[] = $item;
            }
        }

        $output->writeln('<info>Importing concertations into projects...</info>');
        //@todo mettre à quel auteur le projet ?
        $author = $this->em
            ->getRepository(User::class)
            ->findOneBy(['email' => $this->nantesAuthor]);

        foreach ($rows as $key => $row) {
            $presentationStep = (new PresentationStep())
                ->setTitle('Présentation')
                ->setLabel('Présentation')
                ->setBody($row['description']);
            $collectStep = (new CollectStep())
                ->setTitle('Vos contributions')
                ->setLabel('Vos contributions')
                ->setStartAt(new \DateTime())
                ->setEndAt(new \DateTime())
                ->setVoteType(VoteTypeTrait::$VOTE_TYPE_SIMPLE);
            $avisStep = (new OtherStep())->setTitle('Avis Citoyen')->setLabel('Avis Citoyen');
            $resultStep = (new OtherStep())
                ->setTitle('Réponse')
                ->setLabel('Réponse')
                ->setBody($row['closeTextLeft'] . ' ' . $row['closeTextRight']);
            $project = (new Project())
                ->setTitle(isset($row['titre']) ? $row['titre'] : $row['id'])
                ->setAuthor($author)
                ->setCreatedAt(new \DateTime())
                ->setPublishedAt(new \DateTime())
                ->setVisibility(2)
                ->setUpdatedAt(new \DateTime());

            $project->addStep(
                (new ProjectAbstractStep())
                    ->setProject($project)
                    ->setStep($presentationStep)
                    ->setPosition(1)
            );
            $project->addStep(
                (new ProjectAbstractStep())
                    ->setProject($project)
                    ->setStep($collectStep)
                    ->setPosition(2)
            );
            $project->addStep(
                (new ProjectAbstractStep())
                    ->setProject($project)
                    ->setStep($avisStep)
                    ->setPosition(3)
            );
            $project->addStep(
                (new ProjectAbstractStep())
                    ->setProject($project)
                    ->setStep($resultStep)
                    ->setPosition(4)
            );

            $this->em->persist($project);
            $this->em->flush();

            $this->projects[$row['id']] = $project;
            $proposalForm = $this->createProposalForm($output, $project, $key + 2000);

            $collectStep->setProposalForm($proposalForm);

            $this->em->persist($collectStep);
        }
        $this->em->flush();
        $this->em->clear();

        if (\count($this->projects) > 0) {
            foreach ($this->projects as $oldProjectId => $project) {
                $this->importProposals($output, $oldProjectId, $project->getId());
                $this->importActualities($output, $oldProjectId, $project->getId());
            }
        }
        $output->writeln(
            "\n<info>Successfully imported " . \count($this->projects) . ' projects.</info>'
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

    protected function createActualities(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/' . self::ACTUALITY_FILE);
        $csv->setDelimiter(';');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::ACTUALITY_HEADER);
        $actualities = [];
        foreach ($iterator as $item) {
            $actualities[] = $item;
        }
        $actualities = $this->arrayGroupBy($actualities, function ($i) {
            return $i['concertationUuid'];
        });

        return $actualities;
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
            $defaultAuthor = $this->em->getRepository(User::class)->findOneBy([
                'email' => $this->nantesAuthor,
            ]);
            foreach ($proposals as $proposal) {
                $author =
                    $this->em->getRepository(User::class)->findOneBy([
                        'openId' => $proposal['userUuid'],
                    ]) ?? $defaultAuthor;

                $description =
                    '' !== $proposal['videoLink']
                        ? $proposal['description'] .
                            "<br/><a href=\"" .
                            $proposal['videoLink'] .
                            "\">Vidéo</a>"
                        : $proposal['description'];
                $proposal = (new Proposal())
                    ->setTitle('Contribution n° ' . $count)
                    ->setAuthor($author)
                    ->setReference($count)
                    ->setPublishedAt(new \DateTime())
                    ->setProposalForm($step->getProposalForm())
                    ->setReference($count)
                    ->setBody(html_entity_decode($description));
                $this->em->persist($proposal);
                if (0 === $count % self::PROPOSAL_BATCH_SIZE) {
                    $this->printMemoryUsage($output);
                    $this->em->flush();
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

    protected function importActualities(
        OutputInterface $output,
        string $oldProjectId,
        string $projectId
    ): void {
        $project = $this->em->getRepository(Project::class)->find($projectId);
        if ($project && isset($this->actualities[$oldProjectId])) {
            $output->writeln(
                "\n<info>Importing actualities for project \"" .
                    $project->getTitle() .
                    '"...</info>'
            );
            $actualities = $this->actualities[$oldProjectId];
            $progress = new ProgressBar($output, \count($actualities));
            $count = 1;
            foreach ($actualities as $actuality) {
                $author = $this->em->getRepository(User::class)->findOneBy([
                    'email' => $this->nantesAuthor,
                ]);
                if ($author) {
                    $actu = (new Post())
                        ->setTitle(html_entity_decode($actuality['subtitle']))
                        ->addAuthor($author)
                        ->setPublishedAt(new \DateTime($actuality['lastPublishedDate']))
                        ->setIsPublished(true)
                        ->addProject($project)
                        ->setBody(
                            html_entity_decode(
                                $actuality['catchphrase'] . ' ' . $actuality['description']
                            )
                        );

                    try {
                        $filePath =
                            $this->getContainer()->getParameter('kernel.root_dir') .
                            '/../nantesCo/nantesandco';
                        if ('' !== $actuality['image']) {
                            $file = $filePath . $actuality['image'];
                            if (file_exists($file)) {
                                $extension = '.' . explode('/', mime_content_type($file))[1];
                                rename(
                                    $filePath . $actuality['image'],
                                    $filePath .
                                        str_replace(" ", "", $actuality['image']) .
                                        $extension
                                );
                                $file =
                                    $filePath .
                                    str_replace(" ", "", $actuality['image']) .
                                    $extension;
                            } else {
                                if (file_exists($file . '.jpg')) {
                                    $file = $file . '.jpg';
                                } elseif (file_exists($file . '.jpeg')) {
                                    $file = $file . '.jpeg';
                                } elseif (file_exists($file . '.png')) {
                                    $file = $file . '.png';
                                }
                            }
                            $pic = $this->getContainer()
                                ->get(MediaManager::class)
                                ->createImageFromPath($file);
                            $actu->setMedia($pic);
                        }
                    } catch (\Exception $exception) {
                        $output->writeln(
                            '<info>' .
                                $actuality['image'] .
                                '</info> not found. Set default image instead...'
                        );
                    }

                    $this->em->persist($actu);
                    if (0 === $count % self::PROPOSAL_BATCH_SIZE) {
                        $this->printMemoryUsage($output);
                        $this->em->flush();
                    }
                    $progress->advance();
                    ++$count;
                }
            }
            $this->em->flush();
            $progress->finish();
            $output->writeln("\n<info>Successfully imported actualities.</info>");
        } else {
            $output->writeln(
                "\n<info>No actualities found for project \"" . $project->getTitle() . '"</info>'
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
