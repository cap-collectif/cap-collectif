<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Manager\AnalysisConfigurationManager;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputOption;
use Capco\AppBundle\Entity\AnalysisConfiguration;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\AnalysisConfigurationRepository;

class ProcessingProposalCommand extends Command
{
    public const MESSAGE_YES = 'yes';
    protected static $defaultName = 'capco:process_proposals';
    private AnalysisConfigurationManager $analysisConfigurationManager;
    private AnalysisConfigurationRepository $analysisConfigurationRepository;
    private Manager $toggle;

    public function __construct(
        AnalysisConfigurationManager $analysisConfigurationManager,
        Manager $manager,
        AnalysisConfigurationRepository $analysisConfigurationRepository
    ) {
        $this->analysisConfigurationManager = $analysisConfigurationManager;
        $this->analysisConfigurationRepository = $analysisConfigurationRepository;
        $this->toggle = $manager;
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:process_proposals')
            ->setDescription('A method to update a proposal\'s state')
            ->addOption(
                'time',
                't',
                InputOption::VALUE_OPTIONAL,
                '/!\ Should be used for CI only /!\ .The relative time you want to change
                 the proposal\'s. state'
            )
            ->addOption(
                'message',
                'm',
                InputOption::VALUE_OPTIONAL,
                'The message option is used to know if a message should be sent using RabbitMQ',
                self::MESSAGE_YES
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggle->isActive('unstable__analysis')) {
            $output->writeln('error : unstable__analysis not enabled');

            return -1;
        }
        $count = 0;
        $time = $input->getOption('time');
        $shouldSendMessage = $input->getOption('message');
        $sendMessage = self::MESSAGE_YES === $shouldSendMessage;
        $time = \DateTime::createFromFormat('Y-m-d H:i:s', $time ?: date('Y-m-d H:i:s'));

        // We get all analysis configurations within a two hour interval before the given time.
        // AnalysisConfiguration exposes the application date of a proposal selection as "effectiveDate"
        /** @var AnalysisConfiguration[] $unprocessedAnalysisConfig */
        $unprocessedAnalysisConfig = $this->analysisConfigurationRepository->findNotProcessedAnalysisConfiguration(
            $time
        );

        foreach ($unprocessedAnalysisConfig as $analysisConfig) {
            $count += $this->analysisConfigurationManager->processAnalysisConfiguration(
                $analysisConfig,
                $sendMessage
            );
        }

        $output->write("${count} proposals have been processed.", true);

        return 0;
    }
}
