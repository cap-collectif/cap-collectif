<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\Synthesis\SynthesisRepository;
use Capco\AppBundle\Synthesis\Handler\SynthesisHandler;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class UpdateSynthesesCommand extends Command
{
    protected static $defaultName = 'capco:syntheses:update';
    private $synthesisRepository;
    private $handler;

    public function __construct(
        string $name = null,
        SynthesisRepository $synthesisRepository,
        SynthesisHandler $handler
    ) {
        $this->synthesisRepository = $synthesisRepository;
        $this->handler = $handler;

        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:syntheses:update')->setDescription(
            'Update the syntheses from their source data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('Updating all syntheses from their source data.');

        $syntheses = $this->synthesisRepository->findAll();

        foreach ($syntheses as $synthesis) {
            $output->write('.');
            $this->handler->createOrUpdateElementsFromSource($synthesis);
        }

        $output->writeln('');

        $output->writeln(\count($syntheses) . ' syntheses updated');
    }
}
