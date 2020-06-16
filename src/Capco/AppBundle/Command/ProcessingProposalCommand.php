<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Event\DecisionEvent;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Toggle\Manager;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Capco\AppBundle\Entity\ProposalDecision;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputOption;
use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Repository\ProposalRepository;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\ProposalDecisionRepository;
use Capco\AppBundle\Repository\AnalysisConfigurationRepository;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Swarrot\Broker\Message;

class ProcessingProposalCommand extends Command
{
    public const MESSAGE_YES = 'yes';
    protected static $defaultName = 'capco:process_proposals';
    private $analysisConfigurationRepository;
    private $proposalRepository;
    private $proposalDecisionRepository;
    private $publisher;
    private $indexer;
    private $eventDispatcher;
    private $toggle;

    public function __construct(
        Manager $manager,
        ProposalRepository $proposalRepository,
        ProposalDecisionRepository $proposalDecisionRepository,
        AnalysisConfigurationRepository $analysisConfigurationRepository,
        Publisher $publisher,
        EventDispatcherInterface $eventDispatcher,
        Indexer $indexer
    ) {
        $this->analysisConfigurationRepository = $analysisConfigurationRepository;
        $this->proposalRepository = $proposalRepository;
        $this->proposalDecisionRepository = $proposalDecisionRepository;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
        $this->eventDispatcher = $eventDispatcher;
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
        $time = \DateTime::createFromFormat('Y-m-d H:i:s', $time ?: date('Y-m-d H:i:s'));

        // We get all analysis configurations within a two hour interval before the given time.
        // AnalysisConfiguration exposes the application date of a proposal selection as "effectiveDate"
        /** @var AnalysisConfiguration[] $unprocessedAnalysisConfig */
        $unprocessedAnalysisConfig = $this->analysisConfigurationRepository->findNotProcessedAnalysisConfiguration(
            $time
        );

        foreach ($unprocessedAnalysisConfig as $analysisConfig) {
            $proposalsLinkedToFormIds = $this->proposalRepository->findByProposalForm(
                $analysisConfig->getProposalForm()
            );

            if (\count($proposalsLinkedToFormIds) > 0) {
                // ProposalDecisions are decisions made by users not necessary processed. Therefore, we take all
                // processed ProposalDecisions to dispatch the user's choice when marked as "DONE"
                /** @var ProposalDecision[] $proposalDecisions */
                $proposalDecisions = $this->proposalDecisionRepository->findUserProcessedProposalByIds(
                    $proposalsLinkedToFormIds
                );
                foreach ($proposalDecisions as $proposalDecision) {
                    ++$count;
                    $proposal = $proposalDecision->getProposal();
                    if ($proposal) {
                        $approved = $proposalDecision->isApproved();

                        $this->eventDispatcher->dispatch(
                            $approved
                                ? CapcoAppBundleEvents::DECISION_APPROVED
                                : CapcoAppBundleEvents::DECISION_REFUSED,
                            new DecisionEvent($proposal, $proposalDecision, $analysisConfig)
                        );

                        if (self::MESSAGE_YES === $shouldSendMessage) {
                            $this->publisher->publish(
                                CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
                                new Message(
                                    json_encode([
                                        'proposalId' => $proposal->getId(),
                                        'date' => new \DateTime(),
                                    ])
                                )
                            );
                            $this->indexer->index(\get_class($proposal), $proposal->getId());
                            $this->indexer->finishBulk();
                        }
                    }
                }
            }
        }
        $output->write("${count} proposals have been processed.", true);

        return 0;
    }
}
